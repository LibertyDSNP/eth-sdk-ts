/**
 * Parquet Schemas for DSNP Announcement Types
 * See Announcement type definitions in DSNP.d.ts for additional documentation of fields.
 */

import { AnnouncementType, AnnouncementWithSignature, InvalidAnnouncementTypeError } from "../announcements";

/**
 * BloomFilterColumnOptions: bloom filter options for a column intended to be used with when writing a batch file
 */
export interface BloomFilterColumnOptions {
  column: string;
  numFilterBytes?: number;
  falsePositiveRate?: number;
  numDistinct?: number;
}

/**
 * BloomFilterOptions: bloom filter options intended to be used with when writing a batch file
 */
export interface BloomFilterOptions {
  bloomFilters: Array<BloomFilterColumnOptions>;
}

/**
 * Parquet Schema for an announcement type
 */
export type Schema<T extends AnnouncementType> = {
  [Property in keyof AnnouncementWithSignature<T>]: { type: string; statistics?: boolean };
};

type AnnouncementTypeToSchema = {
  [T in AnnouncementType]: {
    // Cannot just put Schema<T> here as TS cannot handle nested mappings correctly
    [Property in keyof AnnouncementWithSignature<T>]: { type: string; statistics?: boolean };
  };
};

/**
 * Tombstone: a public tombstone post
 */
export const TombstoneSchema: Schema<AnnouncementType.Tombstone> = {
  announcementType: { type: "INT32" },
  createdAt: { type: "INT64" },
  fromId: { type: "BYTE_ARRAY" },
  signature: { type: "BYTE_ARRAY", statistics: false },
  targetAnnouncementType: { type: "INT32" },
  targetSignature: { type: "BYTE_ARRAY", statistics: false },
};

/**
 * TombstoneBloomFilter: bloom filter options for batching broadcast announcements
 */
export const TombstoneBloomFilterOptions: BloomFilterOptions = {
  bloomFilters: [{ column: "fromId" }, { column: "targetSignature" }],
};

/**
 * Broadcast: a public post
 */
export const BroadcastSchema: Schema<AnnouncementType.Broadcast> = {
  announcementType: { type: "INT32" },
  contentHash: { type: "BYTE_ARRAY", statistics: false },
  createdAt: { type: "INT64" },
  fromId: { type: "BYTE_ARRAY" },
  signature: { type: "BYTE_ARRAY", statistics: false },
  url: { type: "BYTE_ARRAY" },
};

/**
 * BroadcastBloomFilter: bloom filter options for batching broadcast announcements
 */
export const BroadcastBloomFilterOptions: BloomFilterOptions = {
  bloomFilters: [{ column: "fromId" }],
};

/**
 * Reply: A public reply post
 */
export const ReplySchema: Schema<AnnouncementType.Reply> = {
  announcementType: { type: "INT32" },
  contentHash: { type: "BYTE_ARRAY", statistics: false },
  createdAt: { type: "INT64" },
  fromId: { type: "BYTE_ARRAY" },
  inReplyTo: { type: "BYTE_ARRAY" },
  signature: { type: "BYTE_ARRAY", statistics: false },
  url: { type: "BYTE_ARRAY" },
};

/**
 * ReplyBloomBloomFilter: bloom filter options for batching reply announcements
 */
export const ReplyBloomFilterOptions = {
  bloomFilters: [{ column: "fromId" }, { column: "inReplyTo" }],
};

/**
 * GraphChange: a public follow/unfollow
 * Note followType will be only 0 or 1; other values are invalid
 */
export const GraphChangeSchema: Schema<AnnouncementType.GraphChange> = {
  announcementType: { type: "INT32" },
  changeType: { type: "INT32" },
  createdAt: { type: "INT64" },
  fromId: { type: "BYTE_ARRAY" },
  objectId: { type: "BYTE_ARRAY" },
  signature: { type: "BYTE_ARRAY", statistics: false },
};

/**
 * GraphChangeBloomFilter: bloom filter options for batching graph changes announcements
 */
export const GraphChangeBloomFilterOptions = {
  bloomFilters: [{ column: "fromId" }],
};

/**
 * Profile - a profile change message
 */
export const ProfileSchema: Schema<AnnouncementType.Profile> = {
  announcementType: { type: "INT32" },
  contentHash: { type: "BYTE_ARRAY", statistics: false },
  createdAt: { type: "INT64" },
  fromId: { type: "BYTE_ARRAY" },
  signature: { type: "BYTE_ARRAY", statistics: false },
  url: { type: "BYTE_ARRAY" },
};

/**
 * ProfileBloomFilter: bloom filter options for batching profile announcements
 */
export const ProfileBloomFilterOptions = {
  bloomFilters: [{ column: "fromId" }],
};

/**
 * Reaction: a visual reply to a Broadcast message (aka post)
 */
export const ReactionSchema: Schema<AnnouncementType.Reaction> = {
  announcementType: { type: "INT32" },
  createdAt: { type: "INT64" },
  emoji: { type: "BYTE_ARRAY" },
  fromId: { type: "BYTE_ARRAY" },
  inReplyTo: { type: "BYTE_ARRAY" },
  signature: { type: "BYTE_ARRAY", statistics: false },
};

/**
 * ReactionBloomFilter: bloom filter options for batching reaction announcements
 */
export const ReactionBloomFilterOptions = {
  bloomFilters: [{ column: "emoji" }, { column: "fromId" }, { column: "inReplyTo" }],
};

const schemas: AnnouncementTypeToSchema = {
  [AnnouncementType.Tombstone]: TombstoneSchema,
  [AnnouncementType.GraphChange]: GraphChangeSchema,
  [AnnouncementType.Broadcast]: BroadcastSchema,
  [AnnouncementType.Reply]: ReplySchema,
  [AnnouncementType.Reaction]: ReactionSchema,
  [AnnouncementType.Profile]: ProfileSchema,
};

/**
 * getSchemaFor() takes AnnouncementType and returns its corresponding parquet schema
 *
 * @throws {@link InvalidAnnouncementTypeError}
 * Thrown if the provided announcementType enum is not a valid value.
 * @param announcementType - a announcementType
 * @returns The corresponding parquet schema
 */
export const getSchemaFor = <T extends AnnouncementType>(announcementType: T): Schema<T> => {
  if (schemas[announcementType] === undefined) throw new InvalidAnnouncementTypeError(announcementType);

  return schemas[announcementType];
};

const bloomFilters: Record<AnnouncementType, BloomFilterOptions> = {
  [AnnouncementType.Tombstone]: TombstoneBloomFilterOptions,
  [AnnouncementType.GraphChange]: GraphChangeBloomFilterOptions,
  [AnnouncementType.Broadcast]: BroadcastBloomFilterOptions,
  [AnnouncementType.Reply]: ReplyBloomFilterOptions,
  [AnnouncementType.Reaction]: ReactionBloomFilterOptions,
  [AnnouncementType.Profile]: ProfileBloomFilterOptions,
};

/**
 * getBloomFilterOptionsFor() takes AnnouncementType and returns its bloom filter options
 *
 * @throws {@link InvalidAnnouncementTypeError}
 * Thrown if the provided announcementType enum is not a valid value.
 * @param announcementType - a announcementType
 * @returns The corresponding parquet bloom filter options
 */
export const getBloomFilterOptionsFor = <T extends AnnouncementType>(announcementType: T): BloomFilterOptions => {
  if (bloomFilters[announcementType] === undefined) throw new InvalidAnnouncementTypeError(announcementType);

  return bloomFilters[announcementType];
};
