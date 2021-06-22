import { DSNPMessage, DSNPType } from "../messages/messages";
import parquet from "@dsnp/parquetjs";
const { ParquetReader, ParquetWriter, ParquetSchema } = parquet;
import { WriteStream } from "../store";
import { getSchemaFor, getBloomFilterOptionsFor, Schema, BloomFilterOptions } from "./parquetSchema";
import { EmptyArrayError } from "../utilities";
import { ConfigOpts, requireGetStore } from "../../config";

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

/**
 * createFile() takes a series of DSNP messages and returns a URL
 * for storage location.
 *
 * @param targetPath - The path to and name of file
 * @param messages - An array of DSNPMessage to include in the batch file
 * @param opts - Optional. Configuration overrides, such as store, if any
 * @returns         A URL of the storage location
 * @throws error if messages argument is empty.
 */
export const createFile = async (targetPath: string, messages: DSNPMessage[], opts?: ConfigOpts): Promise<URL> => {
  if (messages.length === 0) throw EmptyArrayError;

  const schema = new ParquetSchema(getSchemaFor(messages[0].dsnpType));
  const bloomFilterOptions = getBloomFilterOptionsFor(messages[0].dsnpType);

  const store = requireGetStore(opts);
  return store.putStream(targetPath, async (writeStream: WriteStream) => {
    await writeBatch(writeStream, schema, messages, bloomFilterOptions);
  });
};

/**
 * writeBatch() takes a series of DSNP messages and returns a Batch file
 * object for publishing.
 *
 * @param writeStream - A writable stream
 * @param schema - The ParquetJS schema for the messages DSNP type
 * @param messages - An array of DSNPMessage to include in the batch file
 * @param opts - Options for creating a Parquet file
 * @returns        A void promise which will either resolve or reject
 */
export const writeBatch = async (
  writeStream: WriteStream,
  schema: Schema,
  messages: DSNPMessage[],
  opts?: BloomFilterOptions
): Promise<void> => {
  const writer = await ParquetWriter.openStream(schema, writeStream, opts);

  await Promise.all(messages.map((message) => writer.appendRow(message)));

  await writer.close();
};

/**
 * openURL() allows users to open a parquet file with a URL.
 *
 * @param url - a URL to fetch parquet file from.
 * @returns a ParquetReader object.
 **/
export const openURL = async (url: URL): Promise<typeof ParquetReader> => ParquetReader.openUrl(url);

/**
 * openFile() allows users to open a parquet file with a path.
 *
 * @param path - to parquet file.
 * @returns a ParquetReader object.
 **/
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
