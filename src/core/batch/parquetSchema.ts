/**
 * Parquet Schemas for DSNP Announcement Types
 * See DSNP type definitions in DSNP.d.ts for additional documentation of fields.
 */

import { DSNPType, InvalidAnnouncementTypeError } from "../announcements";

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

type columnName = string;
type typing = { type: string };
export type Schema = Record<columnName, typing>;

/**
 * Broadcast: a public post
 */
export const BroadcastSchema = {
  dsnpType: { type: "INT32" },
  contentHash: { type: "BYTE_ARRAY" },
  fromId: { type: "BYTE_ARRAY" },
  url: { type: "BYTE_ARRAY" },
  signature: { type: "BYTE_ARRAY" },
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
export const ReplySchema = {
  dsnpType: { type: "INT32" },
  contentHash: { type: "BYTE_ARRAY" },
  fromId: { type: "BYTE_ARRAY" },
  inReplyTo: { type: "BYTE_ARRAY" },
  url: { type: "BYTE_ARRAY" },
  signature: { type: "BYTE_ARRAY" },
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
export const GraphChangeSchema = {
  dsnpType: { type: "INT32" },
  fromId: { type: "BYTE_ARRAY" },
  changeType: { type: "INT32" },
  signature: { type: "BYTE_ARRAY" },
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
export const ProfileSchema = {
  dsnpType: { type: "INT32" },
  fromId: { type: "BYTE_ARRAY" },
  url: { type: "BYTE_ARRAY" },
  signature: { type: "BYTE_ARRAY" },
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
export const ReactionSchema = {
  dsnpType: { type: "INT32" },
  emoji: { type: "BYTE_ARRAY" },
  fromId: { type: "BYTE_ARRAY" },
  inReplyTo: { type: "BYTE_ARRAY" },
  signature: { type: "BYTE_ARRAY" },
};

/**
 * ReactionBloomFilter: bloom filter options for batching reaction announcements
 */
export const ReactionBloomFilterOptions = {
  bloomFilters: [{ column: "emoji" }, { column: "fromId" }, { column: "inReplyTo" }],
};

/**
 * getSchemaFor() takes DSNPType and returns its corresponding parquet schema
 *
 * @throws {@link InvalidAnnouncementTypeError}
 * Thrown if the provided dsnpType enum is not a valid value.
 * @param dsnpType - a dsnpType
 * @returns The corresponding parquet schema
 */
export const getSchemaFor = (dsnpType: DSNPType): Schema => {
  switch (dsnpType) {
    case DSNPType.GraphChange:
      return GraphChangeSchema;
    case DSNPType.Broadcast:
      return BroadcastSchema;
    case DSNPType.Reply:
      return ReplySchema;
    case DSNPType.Reaction:
      return ReactionSchema;
    case DSNPType.Profile:
      return ProfileSchema;
  }

  throw new InvalidAnnouncementTypeError(dsnpType);
};

/**
 * getBloomFilterOptionsFor() takes DSNPType and returns its bloom filter options
 *
 * @throws {@link InvalidAnnouncementTypeError}
 * Thrown if the provided dsnpType enum is not a valid value.
 * @param dsnpType - a dsnpType
 * @returns The corresponding parquet bloom filter options
 */
export const getBloomFilterOptionsFor = (dsnpType: DSNPType): BloomFilterOptions => {
  switch (dsnpType) {
    case DSNPType.GraphChange:
      return GraphChangeBloomFilterOptions;
    case DSNPType.Broadcast:
      return BroadcastBloomFilterOptions;
    case DSNPType.Reply:
      return ReplyBloomFilterOptions;
    case DSNPType.Reaction:
      return ReactionBloomFilterOptions;
    case DSNPType.Profile:
      return ProfileBloomFilterOptions;
  }

  throw new InvalidAnnouncementTypeError(dsnpType);
};
