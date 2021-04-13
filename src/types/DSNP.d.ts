import { EthereumAddress } from "./Strings";
import { ActionType } from "../batch/actionType";
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
  | Reply;

export interface Message {
  /** fromAddress ID of the sender bytes20 */
  fromAddress: EthereumAddress;
  actionType: ActionType;
}

/**
 * Broadcast: a public post
 */
export interface Broadcast extends Message {
  /** messageID keccak-256 hash of content stored at URI bytes32 */
  messageID: string;
  /** uri content URI string */
  uri: string;
}

/**
 * Reply: a public reply post
 */
export interface Reply extends Message {
  /** messageID keccak-256 hash of content stored at uri bytes32 */
  messageID: string;
  /** inReplyTo ID of the message the reply references bytes32 */
  inReplyTo: string;
  /** uri content uri string */
  uri: string;
}

/**
 * Drop: a dead drop message
 */
export interface Drop extends Message {
  /** deadDropID The Dead Drop ID (See DeadDrops bytes32) */
  deadDropID: string;
  /** messageID keccak-256 hash of content bytes32 */
  messageID: string;
  /** uri content uri string */
  uri: string;
}

/**
 * GraphChange: a public follow/unfollow
 */
export interface GraphChange extends Message {
  /** followType follow/unfollow number/enum */
  followType: 0 | 1;
}

/**
 * KeyList, PrivateGraphKeyList, EncryptionKeyList
 */
export interface KeyList extends Message {
  keyList: string[];
  /** keyList new list of valid keys bytes[] */
}

export interface PrivateGraphKeyList extends Message {
  keyList: string[];
}

export interface EncryptionKeyList extends Message {
  keyList: string[];
}

/**
 * Profile - a profile change message
 */
export interface Profile extends Message {
  /** messageID keccak-256 hash of content bytes32 */
  messageID: string;
  /** uri content uri string */
  uri: string;
}

/** Encrypted Inbox: an encrypted direct message: */
export interface EncryptedInbox extends Message {
  /** toAddress ID of the recipient bytes20 */
  toAddress: EthereumAddress;
  /** messageID keccak-256 hash of content bytes32 */
  messageID: string;
  /** uri content uri string */
  uri: string;
}

/**
 * Reaction: a visual reply to a Broadcast message (aka post)
 */
export interface Reaction extends Message {
  /** emoji the encoded reaction number / UTF-8 bytes[] */
  emoji: string;
  /** inReplyTo ID of the message the reaction references bytes32 */
  inReplyTo: string;
}

/**
 * Private: an encrypted message of unknown type
 */
export interface Private extends Message {
  /** encrypted graph change data */
  data: string;
  /** keccak-256 hash of unencrypted content */
  messageID: string;
}
