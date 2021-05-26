import * as fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const parquet = require("@dsnp/parquetjs");
import { times } from "lodash";
import { generateBroadcast, generateReply, generateReaction } from "./dsnpGenerators";
import * as pq from "../../batch/parquet-schema";
import { EthereumAddress } from "../../types/Strings";
import { BatchBroadcastMessage, BatchReactionMessage, BatchReplyMessage } from "../../batch/batchMesssages";
import { generateHexString } from "@dsnp/test-generators";

export type DSNPBatchWriteResult = {
  records: number;
  path: string | undefined;
  error: string;
};

export type BatchMessageType = BatchBroadcastMessage | BatchReactionMessage | BatchReplyMessage;
type BatchGenerator = { (): BatchMessageType };

/**
 * generateBatchBroadcast
 * @param from - a desired fromID (optional)
 */
export const generateBatchBroadcast = (from?: EthereumAddress): BatchBroadcastMessage => {
  return { signature: generateHexString(256), ...generateBroadcast(from) };
};

export const generateBatchReaction = (from?: EthereumAddress): BatchReactionMessage => {
  return { signature: generateHexString(256), ...generateReaction(from) };
};

export const generateBatchReply = (from?: EthereumAddress): BatchReplyMessage => {
  return { signature: generateHexString(256), ...generateReply(from) };
};

export const generateBroadcastBatchFile = async (
  rootDir: string,
  numMessages: number
): Promise<DSNPBatchWriteResult> => {
  return await writeBatchFileWithOptions({
    rootDir: rootDir,
    numMessages: numMessages,
    schema: pq.BroadcastSchema,
    generator: generateBatchBroadcast,
    bloomOptions: pq.BroadcastBloomFilterOptions,
  });
};

export const generateReplyBatchFile = async (rootDir: string, numMessages: number): Promise<DSNPBatchWriteResult> => {
  return await writeBatchFileWithOptions({
    rootDir: rootDir,
    numMessages: numMessages,
    schema: pq.ReplySchema,
    generator: generateBatchReply,
    bloomOptions: pq.ReplyBloomFilterOptions,
  });
};

export const generateReactionBatchFile = async (
  rootDir: string,
  numMessages: number
): Promise<DSNPBatchWriteResult> => {
  return await writeBatchFileWithOptions({
    rootDir: rootDir,
    numMessages: numMessages,
    schema: pq.ReactionSchema,
    generator: generateBatchReaction,
    bloomOptions: pq.ReactionBloomFilterOptions,
  });
};

type writeBatchOptions = {
  rootDir: string;
  numMessages: number;
  schema: pq.Schema;
  generator: BatchGenerator;
  bloomOptions?: pq.BloomFilterOptions;
};

const writeBatchFileWithOptions = async (opts: writeBatchOptions): Promise<DSNPBatchWriteResult> => {
  if (opts.rootDir === "") {
    throw new Error("rootDir can't be blank");
  }
  ensureDir(opts.rootDir);
  const parquetFileName = ["replies", opts.numMessages, timestamp()].join("-") + ".parquet";
  const fname = path.join(opts.rootDir, parquetFileName);
  let itemsWritten = 0;

  try {
    const data = times(opts.numMessages, () => opts.generator());
    const pSchema = new parquet.ParquetSchema(opts.schema);
    const writer = await parquet.ParquetWriter.openFile(pSchema, fname, opts.bloomOptions);
    for (let i = 0; i < data.length; i++) {
      await writer.appendRow(data[i]);
      itemsWritten++;
    }
    await writer.close();
  } catch (e) {
    return { records: -1, path: fname, error: e.toString() };
  }
  return { records: itemsWritten, path: fname, error: "" };
};

const timestamp = (): string => {
  const now = new Date(Date.now());
  return [
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDay(),
    "-",
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    "-",
    now.getUTCMilliseconds(),
  ].join("");
};

const ensureDir = (dirname: string): string | undefined => {
  if (!fs.existsSync(dirname)) {
    throw new Error(`directory does not exist: ${dirname}`);
  } else {
    const stats = fs.statSync(dirname);
    if (!stats.isDirectory()) {
      throw new Error(`is not a directory: ${dirname}`);
    }
  }
  return dirname;
};
