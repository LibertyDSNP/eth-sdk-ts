import * as fs from "fs";
import path from "path";
import parquet from "@dsnp/parquetjs";
import { generateBroadcast, generateReply, generateReaction } from "./dsnpGenerators";
import * as pq from "../core/batch/parquetSchema";
import { EthereumAddress } from "../types/Strings";
import { generateHexString } from "@dsnp/test-generators";
import {
  AnnouncementType,
  SignedBroadcastAnnouncement,
  SignedReactionAnnouncement,
  SignedReplyAnnouncement,
} from "../core/announcements";

export type DSNPBatchWriteResult = {
  records: number;
  path: string;
  error: string;
};

export type BatchAnnouncementType = SignedBroadcastAnnouncement | SignedReactionAnnouncement | SignedReplyAnnouncement;
type BatchGenerator = { (): BatchAnnouncementType };

/**
 * generateBatchBroadcast
 *
 * @param from - a desired fromID (optional)
 */
export const generateBatchBroadcast = (from?: EthereumAddress): SignedBroadcastAnnouncement => {
  return { signature: generateHexString(256), ...generateBroadcast(from) };
};

export const generateBatchReaction = (from?: EthereumAddress): SignedReactionAnnouncement => {
  return { signature: generateHexString(256), ...generateReaction(from) };
};

export const generateBatchReply = (from?: EthereumAddress): SignedReplyAnnouncement => {
  return { signature: generateHexString(256), ...generateReply(from) };
};

export const generateBroadcastBatchFile = async (rootDir: string, numRows: number): Promise<DSNPBatchWriteResult> => {
  return await writeBatchFileWithOptions({
    rootDir: rootDir,
    numRows: numRows,
    schema: pq.BroadcastSchema,
    generator: generateBatchBroadcast,
    bloomOptions: pq.BroadcastBloomFilterOptions,
  });
};

export const generateReplyBatchFile = async (rootDir: string, numRows: number): Promise<DSNPBatchWriteResult> => {
  return await writeBatchFileWithOptions({
    rootDir: rootDir,
    numRows: numRows,
    schema: pq.ReplySchema,
    generator: generateBatchReply,
    bloomOptions: pq.ReplyBloomFilterOptions,
  });
};

export const generateReactionBatchFile = async (rootDir: string, numRows: number): Promise<DSNPBatchWriteResult> => {
  return await writeBatchFileWithOptions({
    rootDir: rootDir,
    numRows: numRows,
    schema: pq.ReactionSchema,
    generator: generateBatchReaction,
    bloomOptions: pq.ReactionBloomFilterOptions,
  });
};

type writeBatchOptions = {
  rootDir: string;
  numRows: number;
  schema: pq.Schema<AnnouncementType>;
  generator: BatchGenerator;
  bloomOptions?: pq.BloomFilterOptions;
};

const writeBatchFileWithOptions = async (opts: writeBatchOptions): Promise<DSNPBatchWriteResult> => {
  if (opts.rootDir === "") {
    throw new Error("rootDir can't be blank");
  }
  ensureDir(opts.rootDir);
  const parquetFileName = ["replies", opts.numRows, timestamp()].join("-") + ".parquet";
  const fname = path.join(opts.rootDir, parquetFileName);
  let itemsWritten = 0;

  try {
    const data = Array.from({ length: opts.numRows }, () => opts.generator());
    const pSchema = new parquet.ParquetSchema(opts.schema);
    const writer = await parquet.ParquetWriter.openFile(pSchema, fname, opts.bloomOptions);
    for (let i = 0; i < data.length; i++) {
      await writer.appendRow(data[i]);
      itemsWritten++;
    }
    await writer.close();
  } catch (e: any) {
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
