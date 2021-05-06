import { MessageType } from "../types/DSNP";
import { NotImplementedError } from "../utilities";
import request from "request";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const parquet = require("@dsnp/parquetjs");
const { ParquetReader } = parquet;

type ReadRowFunction = {
  (row: MessageType): void;
};

interface SplitBlockBloomFilter {
  check(value: number | string): boolean;
}

interface BloomFilterData {
  sbbf: SplitBlockBloomFilter;
  columnName: string;
  RowGroupIndex: number;
}

export type BatchFileObject = string;

/**
 * createFile() takes a series of DSNP messages and returns a Batch file
 * object for publishing. This method is not yet implemented.
 *
 * @param events  An array of DSNPEvents to include in the batch file
 * @returns         A batch file object
 */
export const createFile = (_events: MessageType[]): BatchFileObject => {
  throw NotImplementedError;
};

/**
 * openURL() allows users to open a parquet file with a URL.
 *
 * @param url a URL to fetch parquet file from.
 * @returns a ParquetReader object.
 **/
export const openURL = async (url: URL): Promise<typeof ParquetReader> => ParquetReader.openUrl(request, url);

/**
 * openFile() allows users to open a parquet file with a path.
 *
 * @param path to parquet file.
 * @returns a ParquetReader object.
 **/
export const openFile = async (path: string): Promise<typeof ParquetReader> => ParquetReader.openFile(path);

/**
 * readFile() reads a Parquet file by row.
 *
 * @param reader a ParquetReader object.
 * @returns void.
 */
export const readFile = async (reader: typeof ParquetReader, callback: ReadRowFunction): Promise<void> => {
  const cursor = reader.getCursor();

  let record = null;
  while ((record = await cursor.next())) {
    callback(record);
  }

  return reader.close();
};

/**
 * batchIncludes() checks if a column/field in a
 * Parquet batch file contains an item.
 *
 * @param  reader a ParquetReader object.
 * @param  column the column name to check if a value is included.
 * @param  item a value.
 * @returns void.
 */
export const batchIncludes = async (
  reader: typeof ParquetReader,
  column: string,
  item: number | string
): Promise<boolean> => {
  const bloomFilterData = await reader.getBloomFilters([column]);

  return (bloomFilterData[column] || []).some((data: BloomFilterData) => data.sbbf.check(item));
};
