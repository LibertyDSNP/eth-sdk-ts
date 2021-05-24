import * as fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const parquet = require("@dsnp/parquetjs");
import { times } from "lodash";
import { generateBroadcast } from "./dsnpGenerators";
import { BroadcastSchema } from "../../batch/parquet-schema";

export type DSNPBatchWriteResult = {
  records: number;
  path: string | undefined;
  error: string;
};

export const generateBatchBroadcasts = async (rootDir: string, numMessages: number): Promise<DSNPBatchWriteResult> => {
  if (rootDir === "") {
    throw new Error("rootDir can't be blank");
  }
  ensureDir(rootDir);
  const parquetFileName = ["broadcasts", numMessages, timestamp()].join("-") + ".parquet";
  const fname = path.join([rootDir, parquetFileName]);
  console.log(fname);
  let itemsWritten = 0;

  try {
    const data = times(numMessages, () => generateBroadcast());
    console.log("generated records: ", data.length);

    const pSchema = new parquet.ParquetSchema(BroadcastSchema);

    const writer = await parquet.ParquetWriter.openFile(pSchema, fname);
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
