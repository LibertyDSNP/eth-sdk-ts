/**
 * Parquet Schemas for DNSP Message Types
 * See DSNP type definitions in DSNP.d.ts for additional documentation of fields.
 */

/**
 * Broadcast: a public post
 */
export const BroadcastSchema = {
  actionType: { type: "INT32" },
  contentHash: { type: "BYTE_ARRAY" },
  fromAddress: { type: "BYTE_ARRAY" },
  uri: { type: "BYTE_ARRAY" },
};

/**
 * Reply: A public reply post
 */
export const ReplySchema = {
  actionType: { type: "INT32" },
  fromAddress: { type: "BYTE_ARRAY" },
  contentHash: { type: "BYTE_ARRAY" },
  inReplyTo: { type: "BYTE_ARRAY" },
  uri: { type: "BYTE_ARRAY" },
};

/**
 * GraphChange: a public follow/unfollow
 * Note followType will be only 0 or 1; other values are invalid
 */
export const GraphChangeSchema = {
  actionType: { type: "INT32" },
  fromAddress: { type: "BYTE_ARRAY" },
  changeType: { type: "INT32" },
};

/**
 * Profile - a profile change message
 */
export const ProfileSchema = {
  actionType: { type: "INT32" },
  fromAddress: { type: "BYTE_ARRAY" },
  uri: { type: "BYTE_ARRAY" },
};

/**
 * Reaction: a visual reply to a Broadcast message (aka post)
 */
export const ReactionSchema = {
  actionType: { type: "INT32" },
  fromAddress: { type: "BYTE_ARRAY" },
  contentHash: { type: "BYTE_ARRAY" },
  uri: { type: "BYTE_ARRAY" },
};
