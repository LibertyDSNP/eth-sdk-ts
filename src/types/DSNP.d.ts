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
  export enum ActionType {
    /** Private message and message type are private; message data is encrypted 0 */
    Private = 0,

    /** GraphChange follow or unfollow an account 1 */
    GraphChange,

    /** Broadcast a public post or reply 2 */
    Broadcast,

    /** Profile a Profile change 3 */
    Profile,

    /** KeyList KeyList rotation 4 */
    KeyList,

    /** PrivateGraphKeylist PrivateGraph KeyList rotation 5 */
    PrivateGraphKeyList,

    /** EncryptionKeyList Encryption KeyList rotation 6 */
    EncryptionKeyList,

    /** Reaction a public visual reply to a Broadcast 7 */
    Reaction,

    /** PrivateGraphChange an encrypted follow or unfollow 8 */
    PrivateGraphChange,

    /** Drop a dead drop message 9 */
    Drop,

    /** EncryptedInbox an encrypted direct message 10 */
    EncryptedInbox,

    /** PrivateBroadcast an encrypted broadcast 11 */
    PrivateBroadcast,

    /** Reply a reply to a Broadcast  12 */
    Reply,
  }

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
}
