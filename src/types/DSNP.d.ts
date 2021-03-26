import {EthereumAddress} from "./Strings";

export type ActionType = 1|2|3|4|5|6|7|8|9|10|11|12

export const ActionTypePrivate=0;
export const ActionTypeGraphChange=1;
export const ActionTypeBroadcast=2;
export const ActionTypeProfile=3;
export const ActionTypeKeyList=4;
export const ActionTypePrivateGraphKeyList=5;
export const ActionTypeEncryptionKeyList=6;
export const ActionTypeReaction=7;
export const ActionTypePrivateGraphChange=8;
export const ActionTypeDrop=9;
export const ActionTypeEncryptedInbox=10;
export const ActionTypePrivateBroadcast=11;
export const ActionTypeReply=12;

declare type MessageType =
  | Private
  | GraphChange
  | Broadcast
  | Profile
  | KeyList
  | PrivateGraphKeyList
  | EncryptionKeyList
  | Reaction
  // | PrivateGraphChange
  | Drop
  // | EncryptedInbox
  // | PrivateBroadcast
  | Reply

export type Message = {
  /** fromAddress ID of the sender bytes20 */
  fromAddress: EthereumAddress;
  actionType: ActionType;
};

/**
 * Broadcast: a public post
 */
export interface Broadcast extends Message {
  /** messageID keccak-256 hash of content stored at URI bytes32 */
  messageID: Uint8Array;
  /** uri content URI string */
  uri: string;
}

/**
 * Reply: a public reply post
 */
export interface Reply extends Message {
  /** fromAddress ID of the sender bytes20 */
  fromAddress: EthereumAddress;
  /** messageID keccak-256 hash of content stored at uri bytes32 */
  messageID: Uint8Array;
  /** inReplyTo ID of the message the reply references bytes32 */
  inReplyTo: Uint8Array;
  /** uri content uri string */
  uri: string;
}

/**
 * Drop: a dead drop message
 */
export interface Drop extends Message {
  /** deadDropID The Dead Drop ID (See DeadDrops bytes32) */
  deadDropID: Uint8Array;
  /** messageID keccak-256 hash of content bytes32 */
  messageID: Uint8Array;
  /** uri content uri string */
  uri: string;
}

/**
 * GraphChange: a public follow/unfollow
 */
export interface GraphChange extends Message {
  /** actionType follow/unfollow number/enum */
  followType: 0 | 1;
}

/**
 * KeyList, PrivateGraphKeyList, EncryptionKeyList
 */
export interface KeyList extends Message {
  keyList: Uint8Array[];
  /** keyList new list of valid keys bytes[] */
}

export interface PrivateGraphKeyList extends Message {
  keyList: Uint8Array[];
}

export interface EncryptionKeyList extends Message {
  keyList: Uint8Array[];
}

/**
 * Profile - a profile change message
 */
export interface Profile extends Message {
  /** messageID keccak-256 hash of content bytes32 */
  messageID: Uint8Array;
  /** uri content uri string */
  uri: string;
}

/** Encrypted Inbox: an encrypted direct message: */
export interface EncryptedInbox extends Message {
  /** toAddress ID of the recipient bytes20 */
  toAddress: EthereumAddress;
  /** messageID keccak-256 hash of content bytes32 */
  messageID: Uint8Array;
  /** uri content uri string */
  uri: string;
}

/**
 * Reaction: a visual reply to a Broadcast message (aka post)
 */
export interface Reaction extends Message {
  /** emoji the encoded reaction number / UTF-8 bytes[] */
  emoji: Uint8Array;
  /** inReplyTo ID of the message the reaction references bytes32 */
  inReplyTo: Uint8Array;
}

/**
 * Private: an encrypted message of unknown type
 */
export interface Private extends Message {
  /** encrypted graph change data */
  data: Uint8Array;
  /** keccak-256 hash of unencrypted content */
  messageID: Uint8Array;
}

