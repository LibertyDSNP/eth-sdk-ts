import { ParquetReader, ParquetWriter, ParquetSchema } from "@dsnp/parquetjs";
import { keccak256 } from "js-sha3";

import { DSNPMessageSigned } from "../batch/batchMessages";
import { ConfigOpts, requireGetStore } from "../../config";
import { DSNPType, DSNPTypedMessage } from "../messages/messages";
import { getSchemaFor, getBloomFilterOptionsFor, Schema, BloomFilterOptions } from "./parquetSchema";
import { WriteStream } from "../store";
import { HexString } from "../../types/Strings";

type AsyncOrSyncIterable<T> = AsyncIterable<T> | Iterable<T>;

type ReadRowFunction = {
  (row: DSNPType): void;
};

interface SplitBlockBloomFilter {
  check(value: number | string): boolean;
}

interface BloomFilterData {
  sbbf: SplitBlockBloomFilter;
  columnName: string;
  RowGroupIndex: number;
}

interface BatchFileData {
  url: URL;
  hash: HexString;
}

type BatchMessage<T extends DSNPType> = AsyncOrSyncIterable<DSNPMessageSigned<DSNPTypedMessage<T>>>;

/**
 * createFile() takes a series of Batch DSNP messages, writes them to a file at
 * specified target path and returns a BatchFileData object.
 *
 * @param targetPath - The path to and name of file
 * @param dsnpType - The DSNPType of the messages provided
 * @param messages - An array of DSNPMessage to include in the batch file
 * @param opts - Optional. Configuration overrides, such as store, if any
 * @returns A BatchFileData object including a URL and keccak hash of the file
 */
export const createFile = async <T extends DSNPType>(
  targetPath: string,
  dsnpType: T,
  messages: BatchMessage<T>,
  opts?: ConfigOpts
): Promise<BatchFileData> => {
  const schema = new ParquetSchema(getSchemaFor(dsnpType));
  const bloomFilterOptions = getBloomFilterOptionsFor(dsnpType);

  const store = requireGetStore(opts);
  const hashGenerator = keccak256.create();
  const url = await store.putStream(targetPath, async (writeStream: WriteStream) => {
    const hashingWriteStream = {
      ...writeStream,
      write: (chunk: Uint8Array, ...args: unknown[]): boolean => {
        hashGenerator.update(chunk);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return writeStream.write(chunk, ...(args as any[]));
      },
    };
    await writeBatch(hashingWriteStream, schema, messages, bloomFilterOptions);
  });

  return {
    url,
    hash: hashGenerator.hex(),
  };
};

/**
 * writeBatch() takes a series of Batch DSNP messages, writes them to the given
 * stream and returns a void promise which resolves when done.
 *
 * @param writeStream - A writable stream
 * @param schema - The ParquetJS schema for the messages DSNP type
 * @param messages - An array of DSNPMessage to include in the batch file
 * @param opts - Options for creating a Parquet file
 * @returns A void promise which will either resolve or reject
 */
export const writeBatch = async <T extends DSNPType>(
  writeStream: WriteStream,
  schema: Schema,
  messages: BatchMessage<T>,
  opts?: BloomFilterOptions
): Promise<void> => {
  const writer = await ParquetWriter.openStream(schema, writeStream, opts);

  for await (const message of messages) {
    writer.appendRow(message);
  }

  await writer.close();
};

/**
 * openURL() allows users to open a parquet file with a URL.
 *
 * @param url - a URL to fetch parquet file from.
 * @returns a ParquetReader object.
 */
export const openURL = async (url: URL): Promise<typeof ParquetReader> => ParquetReader.openUrl(url);

/**
 * openFile() allows users to open a parquet file with a path.
 *
 * @param path - to parquet file.
 * @returns a ParquetReader object.
 */
export const openFile = async (path: string): Promise<typeof ParquetReader> => ParquetReader.openFile(path);

/**
 * readFile() reads a Parquet file by row.
 *
 * @param reader - a ParquetReader object.
 * @param doReadRow - The callback for each row
 * @returns void.
 */
export const readFile = async (reader: typeof ParquetReader, doReadRow: ReadRowFunction): Promise<void> => {
  const cursor = reader.getCursor();

  let record = null;
  while ((record = await cursor.next())) {
    doReadRow(record);
  }

  return reader.close();
};

/**
 * includes() checks if a column/field in a Parquet batch file contains an item.
 *
 * @param reader - a ParquetReader object.
 * @param column - the column name to check if a value is included.
 * @param item - a value.
 * @returns void.
 */
export const includes = async (
  reader: typeof ParquetReader,
  column: string,
  item: number | string
): Promise<boolean> => {
  const bloomFilterData = await reader.getBloomFilters([column]);

  return (bloomFilterData[column] || []).some((data: BloomFilterData) => data.sbbf.check(item));
};
