import { ParquetReader, ParquetSchema, ParquetWriter } from "@dsnp/parquetjs";

import { AnnouncementType, AnnouncementWithSignature, SignedAnnouncement } from "../announcements";
import { EmptyBatchError, MixedTypeBatchError } from "./errors";
import { ConfigOpts, requireGetStore } from "../config";
import { BloomFilterOptions, getBloomFilterOptionsFor, getSchemaFor } from "./parquetSchema";
import { WriteStream } from "../store";
import { HexString } from "../../types/Strings";
import { AsyncOrSyncIterable, getHashGenerator } from "../utilities";
import { hexToUint8Array, uint8ArrayToHex } from "./buffers";

type ReadRowFunction<T extends SignedAnnouncement> = {
  (row: T): void | Promise<void>;
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

type SignedAnnouncementIterable<T extends AnnouncementType> = AsyncOrSyncIterable<AnnouncementWithSignature<T>>;

type ParquetRecord = Record<string, Buffer | Uint8Array | bigint | number>;

const parseAnnouncement = <T extends SignedAnnouncement>(record: ParquetRecord): T => {
  const schemas = getSchemaFor(record.announcementType as AnnouncementType);

  const announcement = Object.entries(schemas).reduce<Record<string, string | number | bigint>>(
    (acc, [key, schema]) => {
      const value = record[key];
      if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") {
        acc[key] = value;
      } else if (schema.type === "BYTE_ARRAY") {
        acc[key] = uint8ArrayToHex(value);
      }
      return acc;
    },
    {}
  );

  return announcement as unknown as T;
};

const encodeParquetRecord = <T extends AnnouncementType>(announcement: AnnouncementWithSignature<T>): ParquetRecord => {
  const schemas = getSchemaFor(announcement.announcementType);
  const record: ParquetRecord = {};
  const schema: Record<string, { type: string }> = schemas;
  for (const [key, value] of Object.entries(announcement)) {
    if (schema[key]?.type === "BYTE_ARRAY") {
      record[key] = hexToUint8Array(value);
    } else {
      record[key] = value;
    }
  }

  return record;
};

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
  const hashGenerator = getHashGenerator();
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
  schema: typeof ParquetSchema,
  announcements: SignedAnnouncementIterable<T>,
  opts?: BloomFilterOptions
): Promise<void> => {
  const writer = await ParquetWriter.openStream(schema, writeStream, opts);
  let firstAnnouncementType;

  for await (const announcement of announcements) {
    if (firstAnnouncementType === undefined) firstAnnouncementType = announcement.announcementType;
    if (announcement.announcementType != firstAnnouncementType) throw new MixedTypeBatchError(writeStream);

    await writer.appendRow(encodeParquetRecord(announcement));
  }

  if (firstAnnouncementType === undefined) throw new EmptyBatchError(writeStream);

  await writer.close();
};

/**
 * openURL() allows users to open a parquet file with a URL.
 *
 * @param url - a URL string to fetch parquet file from.
 * @returns a ParquetReader object.
 */
export const openURL = (url: string | URL): Promise<typeof ParquetReader> => ParquetReader.openUrl(url.toString());

/**
 * openFile() allows users to open a parquet file with a path.
 *
 * @param path - to parquet file.
 * @returns a ParquetReader object.
 */
export const openFile = (path: string): Promise<typeof ParquetReader> => ParquetReader.openFile(path);

/**
 * readFile() reads a Parquet file by row.
 *
 * @throws {@link InvalidAnnouncementTypeError}
 * Thrown if the provided announcementType enum is not a valid value.
 * @param reader - a ParquetReader object.
 * @param doReadRow - The callback for each row
 * @returns void.
 */
export const readFile = async <T extends SignedAnnouncement>(
  reader: typeof ParquetReader,
  doReadRow: ReadRowFunction<T>
): Promise<void> => {
  const cursor = reader.getCursor();

  let record: ParquetRecord | null = null;
  while ((record = await cursor.next())) {
    const announcement = parseAnnouncement<T>(record);
    await doReadRow(announcement);
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
