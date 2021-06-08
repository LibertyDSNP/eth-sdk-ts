/**
 * Parquet Schemas for DNSP Message Types
 * See DSNP type definitions in DSNP.d.ts for additional documentation of fields.
 */

export interface BloomFilterColumnOptions {
  column: string;
  numFilterBytes?: number;
  falsePositiveRate?: number;
  numDistinct?: number;
}
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
  uri: { type: "BYTE_ARRAY" },
  signature: { type: "BYTE_ARRAY" },
};

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
  uri: { type: "BYTE_ARRAY" },
  signature: { type: "BYTE_ARRAY" },
};

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
 * Profile - a profile change message
 */
export const ProfileSchema = {
  dsnpType: { type: "INT32" },
  fromId: { type: "BYTE_ARRAY" },
  uri: { type: "BYTE_ARRAY" },
  signature: { type: "BYTE_ARRAY" },
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

export const ReactionBloomFilterOptions = {
  bloomFilters: [{ column: "emoji" }, { column: "fromId" }, { column: "inReplyTo" }],
};