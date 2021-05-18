/**
 * Parquet Schemas for DNSP Message Types
 * See DSNP type definitions in DSNP.d.ts for additional documentation of fields.
 */

/**
 * Broadcast: a public post
 */
export const BroadcastSchema = {
  actionType: { type: "INT32" },
  fromAddress: { type: "BYTE_ARRAY" },
  messageID: { type: "BYTE_ARRAY" },
  uri: { type: "BYTE_ARRAY" },
};

export const ReplySchema = {
  actionType: { type: "INT32" },
  fromAddress: { type: "BYTE_ARRAY" },
  inReplyTo: { type: "BYTE_ARRAY" },
  messageID: { type: "BYTE_ARRAY" },
  uri: { type: "BYTE_ARRAY" },
};

export const DropSchema = {
  actionType: { type: "INT32" },
  fromAddress: { type: "BYTE_ARRAY" },
  deadDropID: { type: "BYTE_ARRAY" },
  messageID: { type: "BYTE_ARRAY" },
  uri: { type: "BYTE_ARRAY" },
};

/**
 * GraphChange: a public follow/unfollow
 * Note followType will be only 0 or 1; other values are invalid
 */
export const GraphChangeSchema = {
  actionType: { type: "INT32" },
  fromAddress: { type: "BYTE_ARRAY" },
  followType: { type: "INT32" },
};

/**
 * KeyList, PrivateGraphKeyList, EncryptionKeyList
 * Note keyList field will need to have additional deserialization to convert to
 * a list of keys
 */
export const KeyListSchema = {
  actionType: { type: "INT32" },
  fromAddress: { type: "BYTE_ARRAY" },
  keyList: { type: "BYTE_ARRAY" },
};

export const PrivateKeyListSchema = KeyListSchema;
export const EncryptionKeyListSchema = KeyListSchema;

/**
 * Profile - a profile change message
 */
export const ProfileSchema = {
  actionType: { type: "INT32" },
  fromAddress: { type: "BYTE_ARRAY" },
  uri: { type: "BYTE_ARRAY" },
};

/**
 * Encrypted Inbox: an encrypted direct message:
 */
export const EncryptedInboxSchema = {
  actionType: { type: "INT32" },
  fromAddress: { type: "BYTE_ARRAY" },
  messageID: { type: "BYTE_ARRAY" },
  uri: { type: "BYTE_ARRAY" },
};

/**
 * Reaction: a visual reply to a Broadcast message (aka post)
 */
export const ReactionSchema = {
  actionType: { type: "INT32" },
  fromAddress: { type: "BYTE_ARRAY" },
  messageID: { type: "BYTE_ARRAY" },
  uri: { type: "BYTE_ARRAY" },
};

/**
 * Private: an encrypted message of unknown type
 */
export const PrivateSchema = {
  actionType: { type: "INT32" },
  fromAddress: { type: "BYTE_ARRAY" },
  data: { type: "BYTE_ARRAY" },
  messageID: { type: "BYTE_ARRAY" },
};
