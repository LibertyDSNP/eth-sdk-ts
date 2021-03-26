import { EthereumAddress } from "./Strings";

export declare type DSNPMessage =
  | DSNP.Broadcast
  | DSNP.Reply
  | DSNP.Drop
  | DSNP.Reaction
  | DSNP.GraphChange
  | DSNP.KeyList
  | DSNP.PrivateGraphKeyList
  | DSNP.Private
  | DSNP.Profile
  | DSNP.EncryptionKeyList;

export declare namespace DSNP {
  /**
   * Broadcast: a public post
   */
  export interface Broadcast {
    /** fromAddress ID of the sender bytes20 */
    fromAddress: EthereumAddress;
    /** messageID keccak-256 hash of content stored at URI bytes32 */
    messageID: Uint8Array;
    /** uri content URI string */
    uri: string;
    actionType: ActionTypeBroadcast;
  }

  /**
   * Reply: a public reply post
   */
  export interface Reply {
    /** fromAddress ID of the sender bytes20 */
    fromAddress: EthereumAddress;
    /** messageID keccak-256 hash of content stored at uri bytes32 */
    messageID: Uint8Array;
    /** inReplyTo ID of the message the reply references bytes32 */
    inReplyTo: Uint8Array;
    /** uri content uri string */
    uri: string;
    actionType: ActionTypeReply;
  }

  /**
   * Drop: a dead drop message
   */
  export interface Drop {
    /** deadDropID The Dead Drop ID (See DeadDrops bytes32) */
    deadDropID: Uint8Array;
    /** messageID keccak-256 hash of content bytes32 */
    messageID: Uint8Array;
    /** uri content uri string */
    uri: string;
    actionType: ActionTypeDrop;
  }

  /**
   * GraphChange: a public follow/unfollow
   */
  export interface GraphChange {
    /** fromAddress ID of the sender bytes20 */
    fromAddress: EthereumAddress;
    /** actionType follow/unfollow number/enum */
    actionType: ActionTypeGraphChange;
  }

  /**
   * KeyList, PrivateGraphKeyList, EncryptionKeyList
   */
  export interface KeyList {
    /** fromAddress ID of the sender bytes20 */
    keyList: Uint8Array[];
    /** keyList new list of valid keys bytes[] */
    fromAddress: EthereumAddress;
    actionType: ActionTypeKeyList;
  }

  export interface PrivateGraphKeyList {
    fromAddress: EthereumAddress;
    keyList: Uint8Array[];
    actionType: ActionTypePrivateGraphKeyList;
  }

  export interface EncryptionKeyList {
    fromAddress: EthereumAddress;
    keyList: Uint8Array[];
    actionType: ActionTypeEncryptionKeyList;
  }

  /**
   * Profile - a profile change message
   */
  export interface Profile {
    /** fromAddress id of the sender bytes20 */
    fromAddress: EthereumAddress;
    /** messageID keccak-256 hash of content bytes32 */
    messageID: Uint8Array;
    /** uri content uri string */
    uri: string;
    actionType: ActionTypeProfile;
  }

  /** Encrypted Inbox: an encrypted direct message: */
  export interface EncryptedInbox {
    /** fromAddress ID of the sender bytes20 */
    fromAddress: EthereumAddress;
    /** toAddress ID of the recipient bytes20 */
    toAddress: EthereumAddress;
    /** messageID keccak-256 hash of content bytes32 */
    messageID: Uint8Array;
    /** uri content uri string */
    uri: string;
    actionType: ActionTypeEncryptedInbox;
  }

  /**
   * Reaction: a visual reply to a Broadcast message (aka post)
   */
  export interface Reaction {
    /** fromAddress id of the sender bytes20 */
    fromAddress: EthereumAddress;
    /** emoji the encoded reaction number / UTF-8 bytes[] */
    emoji: Uint8Array;
    /** inReplyTo ID of the message the reaction references bytes32 */
    inReplyTo: Uint8Array;
    actionType: ActionTypeReaction;
  }

  /**
   * Private: an encrypted message of unknown type
   */
  export interface Private {
    /** ID of the sender */
    fromAddress: EthereumAddress;
    /* encrypted graph change data */
    data: Uint8Array;
    /** keccak-256 hash of unencrypted content */
    messageID: Uint8Array;
    actionType: ActionTypePrivate;
  }

  /**
   * Private message and message type are private; message data is encrypted 0
   * GraphChange follow or unfollow an account 1
   * Broadcast a public post or reply 2
   * Profile a Profile change 3
   * KeyList KeyList rotation 4
   * PrivateGraphKeylist PrivateGraph KeyList rotation 5
   * EncryptionKeyList Encryption KeyList rotation 6
   * Reaction a public visual reply to a Broadcast 7
   * PrivateGraphChange an encrypted follow or unfollow 8
   * Drop a dead drop message 9
   * EncryptedInbox an encrypted direct message 10
   * PrivateBroadcast an encrypted broadcast 11
   */
  export type ActionTypePrivate = 0;
  export type ActionTypeGraphChange = 1;
  export type ActionTypeBroadcast = 2;
  export type ActionTypeProfile = 3;
  export type ActionTypeKeyList = 4;
  export type ActionTypePrivateGraphKeyList = 5;
  export type ActionTypeEncryptionKeyList = 6;
  export type ActionTypeReaction = 7;
  export type ActionTypePrivateGraphChange = 8;
  export type ActionTypeDrop = 9;
  export type ActionTypeEncryptedInbox = 10;
  export type ActionTypePrivateBroadcast = 11;
  export type ActionTypeReply = 12;

  export type ActionType =
    | ActionTypePrivate
    | ActionTypeGraphChange
    | ActionTypeBroadcast
    | ActionTypeProfile
    | ActionTypeKeyList
    | ActionTypePrivateGraphKeyList
    | ActionTypeEncryptionKeyList
    | ActionTypeReaction
    | ActionTypePrivateGraphChange
    | ActionTypeDrop
    | ActionTypeEncryptedInbox
    | ActionTypePrivateBroadcast
    | ActionTypeReply;
}
