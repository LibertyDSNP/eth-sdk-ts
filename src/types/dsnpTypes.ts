import { EthereumAddress } from "@liberty30/lib-privacy-js";

// Broadcast: a public post
// fromAddress	ID of the sender	bytes20
// messageID	keccak-256 hash of content stored at URI	bytes32
// uri	content URI	string
export interface DSNPBroadcast {
  fromAddress: EthereumAddress;
  messageID: Uint8Array;
  uri: string;
}

// Reply: a public reply post
// fromAddress	ID of the sender	bytes20
// inReplyTo	ID of the message the reply references	bytes32
// messageID	keccak-256 hash of content stored at uri	bytes32
// uri	content uri	string
export interface DSNPReply {
  fromAddress: EthereumAddress;
  inReplyTo: Uint8Array;
  messageID: Uint8Array;
  uri: string;
}

// Drop: a dead drop message
// deadDropID	The Dead Drop ID (See DeadDrops	bytes32)
// messageID	keccak-256 hash of content	bytes32
// uri	content uri	string
export interface Drop {
  deadDropID: Uint8Array;
  messageID: Uint8Array;
  uri: string;
}

// GraphChange: a public follow/unfollow
// fromAddress	ID of the sender	bytes20
// actionType	follow/unfollow	number/enum
export interface GraphChange {
  fromAddress: EthereumAddress;
  actionType: number;
}

// KeyList, PrivateGraphKeyList, EncryptionKeyList
// fromAddress	ID of the sender	bytes20
// keyList	new list of valid keys	bytes[]
export interface KeyList {
  fromAddress: EthereumAddress;
  keyList: Uint8Array[];
}

export interface PrivateGraphKeyList {
  fromAddress: EthereumAddress;
  keyList: Uint8Array[];
}

export interface EncryptionKeyList {
  fromAddress: EthereumAddress;
  keyList: Uint8Array[];
}

// Inbox: direct message
// fromAddress	id of the sender	bytes20
// toAddress	ID of the recipient	bytes20
// messageID	keccak-256 hash of content	bytes32
// uri	content uri	string
export interface Inbox {
  fromAddress: EthereumAddress;
  toAddress: EthereumAddress;
  messageID: Uint8Array;
  uri: string;
}

// Encrypted Inbox:  an encrypted direct message:
// toAddress	ID of the recipient	bytes20
// fromAddress	ID of the sender	bytes20
// messageID	keccak-256 hash of content	bytes32
// uri	content uri	string
export interface EncryptedInbox {
  fromAddress: EthereumAddress;
  toAddress: EthereumAddress;
  messageID: Uint8Array;
  uri: string;
}

// Reaction: a visual reply to a Broadcast message (aka post)
// fromAddress	id of the sender	bytes20
// emoji	the encoded reaction	number / UTF-8 bytes[]
// inReplyTo	ID of the message the reaction references	bytes32
export interface Reaction {
  fromAddress: EthereumAddress;
  emoji: Uint8Array;
  inReplyTo: Uint8Array;
}

// Private: an encrypted message of unknown type
// fromAddress	id of the sender	bytes20
// data	encrypted graph change data	string
// messageID	keccak-256 hash of unencrypted content	bytes32
export interface Private {
  fromAddress: EthereumAddress;
  data: Uint8Array;
  messageID: Uint8Array;
}
