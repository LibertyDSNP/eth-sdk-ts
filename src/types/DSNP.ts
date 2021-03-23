import { EthereumAddress } from "./Strings";

export type DSNPMessage =
  | DSNP.Broadcast
  | DSNP.Reply
  | DSNP.Drop
  | DSNP.Reaction
  | DSNP.GraphChange
  | DSNP.KeyList
  | DSNP.PrivateGraphKeyList
  | DSNP.Private
  | DSNP.EncryptionKeyList;

export namespace DSNP {
  /**
   * Broadcast: a public post
   */
  export interface Broadcast {
    /** fromAddress	ID of the sender	bytes20 */
    fromAddress: EthereumAddress;
    /** messageID	keccak-256 hash of content stored at URI	bytes32 */
    messageID: Uint8Array;
    /** uri	content URI	string */
    uri: string;
  }

  /**
   * Reply: a public reply post
   */
  export interface Reply {
    /** fromAddress	ID of the sender	bytes20 */
    fromAddress: EthereumAddress;
    /** messageID	keccak-256 hash of content stored at uri	bytes32 */
    messageID: Uint8Array;
    /** inReplyTo	ID of the message the reply references	bytes32 */
    inReplyTo: Uint8Array;
    /** uri	content uri	string */
    uri: string;
  }

  /**
   * Drop: a dead drop message
   */
  export interface Drop {
    /** deadDropID	The Dead Drop ID (See DeadDrops	bytes32) */
    deadDropID: Uint8Array;
    /** messageID	keccak-256 hash of content	bytes32 */
    messageID: Uint8Array;
    /** uri	content uri	string */
    uri: string;
  }

  /**
   * GraphChange: a public follow/unfollow
   */
  export interface GraphChange {
    /** fromAddress	ID of the sender	bytes20 */
    fromAddress: EthereumAddress;
    /** actionType	follow/unfollow	number/enum */
    actionType: number;
  }

  /**
   * KeyList, PrivateGraphKeyList, EncryptionKeyList
   */
  export interface KeyList {
    /** fromAddress	ID of the sender	bytes20 */
    keyList: Uint8Array[];
    /** keyList	new list of valid keys	bytes[] */
    fromAddress: EthereumAddress;
  }

  export interface PrivateGraphKeyList {
    fromAddress: EthereumAddress;
    keyList: Uint8Array[];
  }

  export interface EncryptionKeyList {
    fromAddress: EthereumAddress;
    keyList: Uint8Array[];
  }

  /**
   * Inbox: direct message
   */
  export interface Inbox {
    /** fromAddress	id of the sender	bytes20 */
    fromAddress: EthereumAddress;
    /** toAddress	ID of the recipient	bytes20 */
    toAddress: EthereumAddress;
    /** messageID	keccak-256 hash of content	bytes32 */
    messageID: Uint8Array;
    /** uri	content uri	string */
    uri: string;
  }

  /** Encrypted Inbox:  an encrypted direct message: */
  export interface EncryptedInbox {
    /** fromAddress	ID of the sender	bytes20 */
    fromAddress: EthereumAddress;
    /** toAddress	ID of the recipient	bytes20 */
    toAddress: EthereumAddress;
    /** messageID	keccak-256 hash of content	bytes32 */
    messageID: Uint8Array;
    /** uri	content uri	string */
    uri: string;
  }

  /**
   * Reaction: a visual reply to a Broadcast message (aka post)
   */
  export interface Reaction {
    /** fromAddress	id of the sender	bytes20 */
    fromAddress: EthereumAddress;
    /** emoji	the encoded reaction	number / UTF-8 bytes[] */
    emoji: Uint8Array;
    /** inReplyTo	ID of the message the reaction references	bytes32 */
    inReplyTo: Uint8Array;
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
  }
}
