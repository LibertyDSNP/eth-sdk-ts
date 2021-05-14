import { keccak256 } from "js-sha3";
import secp256k1 from "secp256k1";

import { HexString } from "../types/Strings";
import { sortObject } from "../utilities/json";

/**
 * DSNPType: an enum representing different types of DSNP messages
 */
export enum DSNPType {
  Broadcast,
  Reply,
  Reaction,
}

/**
 * DSNPMessage: a message intended for inclusion in a batch file
 */
export interface DSNPMessage {
  type: DSNPType;
}

/**
 * BroadcastMessage: a DSNP message of type Broadcast
 */
export interface BroadcastMessage extends DSNPMessage {
  type: DSNPType.Broadcast;
  contentHash: string;
  fromId: string;
  uri: string;
}

/**
 * createBroadcastMessage() generates a broadcast message from a given URI and
 * hash.
 *
 * @param   fromId The id of the user from whom the message is posted
 * @param   uri    The URI of the activity pub content to reference
 * @param   hash   The hash of the content at the URI
 * @param   opts   Optional. Configuration overrides, such as from address, if any
 * @returns        A BroadcastMessage
 */
export const createBroadcastMessage = (fromId: string, uri: string, hash: HexString): BroadcastMessage => ({
  type: DSNPType.Broadcast,
  contentHash: hash,
  fromId,
  uri,
});

/**
 * ReplyMessage: a DSNP message of type Reply
 */
export interface ReplyMessage extends DSNPMessage {
  type: DSNPType.Reply;
  contentHash: string;
  fromId: string;
  inReplyTo: string;
  uri: string;
}

/**
 * createReplyMessage() generates a reply message from a given URI, hash and
 * message identifier.
 *
 * @param   fromId    The id of the user from whom the message is posted
 * @param   uri       The URI of the activity pub content to reference
 * @param   hash      The hash of the content at the URI
 * @param   inReplyTo The message id of the parent message
 * @param   opts      Optional. Configuration overrides, such as from address, if any
 * @returns           A ReplyMessage
 */
export const createReplyMessage = (fromId: string, uri: string, hash: HexString, inReplyTo: string): ReplyMessage => ({
  type: DSNPType.Reply,
  contentHash: hash,
  fromId,
  inReplyTo,
  uri,
});

/**
 * ReactionMessage: a DSNP message of type Reaction
 */
export interface ReactionMessage extends DSNPMessage {
  type: DSNPType.Reaction;
  emoji: string;
  fromId: string;
  inReplyTo: string;
}

/**
 * createReactionMessage() generates a reply message from a given URI, hash and
 * message identifier.
 *
 * @param   fromId    The id of the user from whom the message is posted
 * @param   emoji     The emoji to respond with
 * @param   inReplyTo The message id of the parent message
 * @param   opts      Optional. Configuration overrides, such as from address, if any
 * @returns           A ReactionMessage
 */
export const createReactionMessage = (fromId: string, emoji: string, inReplyTo: string): ReactionMessage => ({
  type: DSNPType.Reaction,
  emoji,
  fromId,
  inReplyTo,
});

/**
 * hash() takes a DSNPMessage and returns a standard hash for use in signatures
 * as defined in the [Message Signatures](https://github.com/LibertyDSNP/spec/blob/main/pages/Messages/Signatures.md)
 * specification.
 *
 * @param   message The message to hash
 * @returns         A Uint8Array of the resulting hash
 */
export const hash = (message: DSNPMessage): Uint8Array => {
  const sortedMessage = sortObject((message as unknown) as Record<string, unknown>);
  let serialization = "";

  for (const key in sortedMessage) {
    serialization = `${serialization}${key}${sortedMessage[key]}`;
  }

  return new Uint8Array(keccak256.digest(serialization));
};

/**
 * sign() takes a private key and DSNP message and returns a Uint8Array
 * signature for the message.
 *
 * @param privateKey The private key to use for signing
 * @param message    The DSNP message to sign
 * @returns          The message signature as a Uint8Array
 */
export const sign = (privateKey: Uint8Array, message: DSNPMessage): Uint8Array =>
  secp256k1.ecdsaSign(hash(message), privateKey).signature;

/**
 * verify() takes a public key, DSNP message and a message signature and returns
 * whether the signature is valid for the given key and message.
 *
 * @param publicKey The public key of the message signer
 * @param message   The DSNP message to sign
 * @param signature The message signature to validate
 * @returns         A boolean indicating if the signature is valid
 */
export const verify = (publicKey: Uint8Array, message: DSNPMessage, signature: Uint8Array): boolean =>
  secp256k1.ecdsaVerify(signature, hash(message), publicKey);
