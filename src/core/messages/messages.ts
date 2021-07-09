import { ethers } from "ethers";

import { ConfigOpts, requireGetSigner } from "../../config";
import { HexString } from "../../types/Strings";
import { sortObject } from "../utilities/json";
import { DSNPMessageSigned } from "../batch/batchMessages";

/**
 * DSNPType: an enum representing different types of DSNP messages
 */
export enum DSNPType {
  GraphChange = 1,
  Broadcast = 2,
  Reply = 3,
  Reaction = 4,
  Profile = 5,
}

/**
 * DSNPMessage: a message intended for inclusion in a batch file
 */
export type DSNPMessage = DSNPTypedMessage<DSNPType>;

/**
 * DSNPTypedMessage: a DSNP message with a particular DSNPType
 */
export interface DSNPTypedMessage<T extends DSNPType> {
  dsnpType: T;
}

/**
 * BroadcastMessage: a DSNP message of type Broadcast
 */
export interface BroadcastMessage extends DSNPTypedMessage<DSNPType.Broadcast> {
  contentHash: string;
  fromId: string;
  uri: string;
}

/**
 * createBroadcastMessage() generates a broadcast message from a given URI and
 * hash.
 *
 * @param fromId - The id of the user from whom the message is posted
 * @param uri - The URI of the activity pub content to reference
 * @param hash - The hash of the content at the URI
 * @returns A BroadcastMessage
 */
export const createBroadcastMessage = (fromId: string, uri: string, hash: HexString): BroadcastMessage => ({
  dsnpType: DSNPType.Broadcast,
  contentHash: hash,
  fromId,
  uri,
});

/**
 * ReplyMessage: a DSNP message of type Reply
 */
export interface ReplyMessage extends DSNPTypedMessage<DSNPType.Reply> {
  contentHash: HexString;
  fromId: string;
  inReplyTo: string;
  uri: string;
}

/**
 * createReplyMessage() generates a reply message from a given URI, hash and
 * message identifier.
 *
 * @param fromId    - The id of the user from whom the message is posted
 * @param uri       - The URI of the activity pub content to reference
 * @param hash      - The hash of the content at the URI
 * @param inReplyTo - The message id of the parent message
 * @returns A ReplyMessage
 */
export const createReplyMessage = (fromId: string, uri: string, hash: HexString, inReplyTo: string): ReplyMessage => ({
  dsnpType: DSNPType.Reply,
  contentHash: hash,
  fromId,
  inReplyTo,
  uri,
});

/**
 * ReactionMessage: a DSNP message of type Reaction
 */
export interface ReactionMessage extends DSNPTypedMessage<DSNPType.Reaction> {
  emoji: string;
  fromId: string;
  inReplyTo: string;
}

/**
 * createReactionMessage() generates a reply message from a given URI, hash and
 * message identifier.
 *
 * @param   fromId    - The id of the user from whom the message is posted
 * @param   emoji     - The emoji to respond with
 * @param   inReplyTo - The message id of the parent message
 * @returns A ReactionMessage
 */
export const createReactionMessage = (fromId: string, emoji: string, inReplyTo: string): ReactionMessage => ({
  dsnpType: DSNPType.Reaction,
  emoji,
  fromId,
  inReplyTo,
});

/**
 * DSNPGraphChangeType: an enum representing different types of graph changes
 */
export enum DSNPGraphChangeType {
  Follow = 1,
  Unfollow = 2,
}

/**
 * GraphChangeMessage: a DSNP message of type GraphChange
 */
export interface GraphChangeMessage extends DSNPTypedMessage<DSNPType.GraphChange> {
  fromId: string;
  changeType: DSNPGraphChangeType;
  objectId: string;
}

/**
 * createFollowGraphChangeMessage() generates a follow graph change message from
 * a given DSNP user id.
 *
 * @param   fromId     - The id of the user from whom the message is posted
 * @param   followeeId - The id of the user to follow
 * @returns A GraphChangeMessage
 */
export const createFollowGraphChangeMessage = (fromId: string, followeeId: string): GraphChangeMessage => ({
  fromId,
  dsnpType: DSNPType.GraphChange,
  changeType: DSNPGraphChangeType.Follow,
  objectId: followeeId,
});

/**
 * createUnfollowGraphChangeMessage() generates an unfollow graph change message
 * from a given DSNP user id.
 *
 * @param   fromId     - The id of the user from whom the message is posted
 * @param   followeeId - The id of the user to unfollow
 * @returns A GraphChangeMessage
 */
export const createUnfollowGraphChangeMessage = (fromId: string, followeeId: string): GraphChangeMessage => ({
  fromId,
  dsnpType: DSNPType.GraphChange,
  changeType: DSNPGraphChangeType.Unfollow,
  objectId: followeeId,
});

/**
 * serialize() takes a DSNP message and returns a serialized string.
 *
 * @param message - The DSNP message to serialized
 * @returns A string serialization of the message
 */
export const serialize = (message: DSNPMessage): string => {
  const sortedMessage = sortObject((message as unknown) as Record<string, unknown>);
  let serialization = "";

  for (const key in sortedMessage) {
    serialization = `${serialization}${key}${sortedMessage[key]}`;
  }

  return serialization;
};

/**
 * ProfileMessage: a DSNP message of type Profile
 */
export interface ProfileMessage extends DSNPTypedMessage<DSNPType.Profile> {
  contentHash: string;
  fromId: string;
  uri: string;
}

/**
 * createProfileMessage() generates a profile message from a given URI and hash.
 *
 * @param   fromId - The id of the user from whom the message is posted
 * @param   uri    - The URI of the activity pub content to reference
 * @param   hash   - The hash of the content at the URI
 * @returns A ProfileMessage
 */
export const createProfileMessage = (fromId: string, uri: string, hash: HexString): ProfileMessage => ({
  dsnpType: DSNPType.Profile,
  contentHash: hash,
  fromId,
  uri,
});

/**
 * sign() takes a DSNP message and returns a signed DSNP message ready for
 * inclusion in a batch.
 *
 * @throws {@link MissingSigner}
 * This error is thrown if no Signer is defined in the configuration options.
 * @param message - The DSNP message to sign
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns The signed DSNP message
 */
export const sign = async <T extends DSNPMessage>(message: T, opts?: ConfigOpts): Promise<DSNPMessageSigned<T>> => {
  const signer = requireGetSigner(opts);
  const signature = await signer.signMessage(serialize(message));
  return {
    ...message,
    signature,
  };
};

/**
 * recoverPublicKey() takes a DSNP message and a message signature and returns
 * the corresponding public key for validation.
 *
 * @param message - The DSNP message to sign
 * @param signature - The message signature to validate
 * @returns The address of the signer in hex
 */
export const recoverPublicKey = (message: DSNPMessage, signature: HexString): HexString => {
  return ethers.utils.verifyMessage(serialize(message), signature);
};
