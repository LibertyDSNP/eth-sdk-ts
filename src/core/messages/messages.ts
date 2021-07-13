import { HexString } from "../../types/Strings";
import { sortObject } from "../utilities/json";

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
  url: string;
}

/**
 * ReplyMessage: a DSNP message of type Reply
 */
export interface ReplyMessage extends DSNPTypedMessage<DSNPType.Reply> {
  contentHash: HexString;
  fromId: string;
  inReplyTo: string;
  url: string;
}

/**
 * ReactionMessage: a DSNP message of type Reaction
 */
export interface ReactionMessage extends DSNPTypedMessage<DSNPType.Reaction> {
  emoji: string;
  fromId: string;
  inReplyTo: string;
}

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
 * ProfileMessage: a DSNP message of type Profile
 */
export interface ProfileMessage extends DSNPTypedMessage<DSNPType.Profile> {
  contentHash: string;
  fromId: string;
  url: string;
}

/**
 * createBroadcastMessage() generates a broadcast message from a given URL and
 * hash.
 *
 * @param fromId - The id of the user from whom the message is posted
 * @param url - The URL of the activity content to reference
 * @param hash - The hash of the content at the URL
 * @returns A BroadcastMessage
 */
export const createBroadcastMessage = (fromId: string, url: string, hash: HexString): BroadcastMessage => ({
  dsnpType: DSNPType.Broadcast,
  contentHash: hash,
  fromId,
  url,
});

/**
 * createReplyMessage() generates a reply message from a given URL, hash and
 * message identifier.
 *
 * @param fromId    - The id of the user from whom the message is posted
 * @param url       - The URL of the activity content to reference
 * @param hash      - The hash of the content at the URL
 * @param inReplyTo - The message id of the parent message
 * @returns A ReplyMessage
 */
export const createReplyMessage = (fromId: string, url: string, hash: HexString, inReplyTo: string): ReplyMessage => ({
  dsnpType: DSNPType.Reply,
  contentHash: hash,
  fromId,
  inReplyTo,
  url,
});

/**
 * createReactionMessage() generates a reply message from a given URL, hash and
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
 * createProfileMessage() generates a profile message from a given URL and hash.
 *
 * @param   fromId - The id of the user from whom the message is posted
 * @param   url    - The URL of the activity content to reference
 * @param   hash   - The hash of the content at the URL
 * @returns A ProfileMessage
 */
export const createProfileMessage = (fromId: string, url: string, hash: HexString): ProfileMessage => ({
  dsnpType: DSNPType.Profile,
  contentHash: hash,
  fromId,
  url,
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
