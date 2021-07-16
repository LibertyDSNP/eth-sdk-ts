import { ParquetReader, ParquetWriter, ParquetSchema } from "@dsnp/parquetjs";
import { keccak256 } from "js-sha3";

import { AnnouncementWithSignature, AnnouncementType, TypedAnnouncement } from "../announcements";
import { MixedTypeBatchError, EmptyBatchError } from "./batchErrors";
import { ConfigOpts, requireGetStore } from "../../config";
import { getSchemaFor, getBloomFilterOptionsFor, Schema, BloomFilterOptions } from "./parquetSchema";
import { WriteStream } from "../store";
import { HexString } from "../../types/Strings";
import { AsyncOrSyncIterable } from "../utilities";

type ReadRowFunction = {
  (row: AnnouncementType): void;
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

type SignedAnnouncementIterable<T extends AnnouncementType> = AsyncOrSyncIterable<
  AnnouncementWithSignature<TypedAnnouncement<T>>
>;

/**
 * createFile() takes a series of Signed Announcements, writes them to a file at
 * specified target path and returns a BatchFileData object.
 *
 * @throws {@link MissingStoreConfigError}
 * Thrown if the store is not configured.
 * @throws {@link EmptyBatchError}
 * Thrown if the announcement iterator provided is empty.
 * @throws {@link MixedTypeBatchError}
 * Thrown if the announcement iterator provided contains multiple announcement types.
 * @param targetPath - The path to and name of file
 * @param announcements - An array of Announcements to include in the batch file
 * @param opts - Optional. Configuration overrides, such as store, if any
 * @returns A BatchFileData object including a URL and keccak hash of the file
 */
export const createFile = async <T extends AnnouncementType>(
  targetPath: string,
  announcements: SignedAnnouncementIterable<T>,
  opts?: ConfigOpts
): Promise<BatchFileData> => {
  let announcementType;

  for await (const announcement of announcements) {
    announcementType = announcement.announcementType;
    break;
  }

  if (announcementType === undefined) throw new EmptyBatchError();

  const schema = new ParquetSchema(getSchemaFor(announcementType));
  const bloomFilterOptions = getBloomFilterOptionsFor(announcementType);

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
      end: (...args: unknown[]): void => {
        if (typeof args[0] == "object" && Object(args[0]).constructor === Uint8Array)
          hashGenerator.update(args[0] as Uint8Array);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return writeStream.end(...(args as any[]));
      },
    };
    await writeBatch(hashingWriteStream, schema, announcements, bloomFilterOptions);
  });

  return {
    url,
    hash: hashGenerator.hex(),
  };
};

/**
 * writeBatch() takes a series of Signed Announcements, writes them to the given
 * stream and returns a void promise which resolves when done.
 *
 * @throws {@link EmptyBatchError}
 * Thrown if the announcement iterator provided is empty.
 * @throws {@link MixedTypeBatchError}
 * Thrown if the announcement iterator provided contains multiple announcement types.
 * @param writeStream - A writable stream
 * @param schema - The ParquetJS schema for the announcements announcement type
 * @param announcements - An array of signed announcements to include in the batch file
 * @param opts - Options for creating a Parquet file
 * @returns A void promise which will either resolve or reject
 */
export const writeBatch = async <T extends AnnouncementType>(
  writeStream: WriteStream,
  schema: Schema,
  announcements: SignedAnnouncementIterable<T>,
  opts?: BloomFilterOptions
): Promise<void> => {
  const writer = await ParquetWriter.openStream(schema, writeStream, opts);
  let firstAnnouncementType;

  for await (const announcement of announcements) {
    if (firstAnnouncementType === undefined) firstAnnouncementType = announcement.announcementType;
    if (announcement.announcementType != firstAnnouncementType) throw new MixedTypeBatchError(writeStream);
    await writer.appendRow(announcement);
  }

  if (firstAnnouncementType === undefined) throw new EmptyBatchError(writeStream);

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
