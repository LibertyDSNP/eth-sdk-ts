import { HexString } from "../../types/Strings";

/**
 * DSNPType: an enum representing different types of DSNP announcements
 */
export enum DSNPType {
  GraphChange = 1,
  Broadcast = 2,
  Reply = 3,
  Reaction = 4,
  Profile = 5,
}

/**
 * Announcement: an Announcement intended for inclusion in a batch file
 */
export type Announcement = TypedAnnouncement<DSNPType>;

/**
 * TypedAnnouncement: an Announcement with a particular DSNPType
 */
export interface TypedAnnouncement<T extends DSNPType> {
  dsnpType: T;
}

/**
 * BroadcastAnnouncement: an Announcement of type Broadcast
 */
export interface BroadcastAnnouncement extends TypedAnnouncement<DSNPType.Broadcast> {
  contentHash: string;
  fromId: string;
  url: string;
}

/**
 * createBroadcast() generates a broadcast announcement from a given URL and
 * hash.
 *
 * @param fromId - The id of the user from whom the announcement is posted
 * @param url - The URL of the activity content to reference
 * @param hash - The hash of the content at the URL
 * @returns A BroadcastAnnouncement
 */
export const createBroadcast = (fromId: string, url: string, hash: HexString): BroadcastAnnouncement => ({
  dsnpType: DSNPType.Broadcast,
  contentHash: hash,
  fromId,
  url,
});

/**
 * ReplyAnnouncement: am announcement of type Reply
 */
export interface ReplyAnnouncement extends TypedAnnouncement<DSNPType.Reply> {
  contentHash: HexString;
  fromId: string;
  inReplyTo: string;
  url: string;
}

/**
 * createReply() generates a reply announcement from a given URL, hash and
 * announcement identifier.
 *
 * @param fromId    - The id of the user from whom the announcement is posted
 * @param url       - The URL of the activity content to reference
 * @param hash      - The hash of the content at the URL
 * @param inReplyTo - The DSNP Announcement Id of the parent announcement
 * @returns A ReplyAnnouncement
 */
export const createReply = (fromId: string, url: string, hash: HexString, inReplyTo: string): ReplyAnnouncement => ({
  dsnpType: DSNPType.Reply,
  contentHash: hash,
  fromId,
  inReplyTo,
  url,
});

/**
 * ReactionAnnouncement: an Announcement of type Reaction
 */
export interface ReactionAnnouncement extends TypedAnnouncement<DSNPType.Reaction> {
  emoji: string;
  fromId: string;
  inReplyTo: string;
}

/**
 * createReaction() generates a reaction announcement from a given URL, hash and
 * announcement identifier.
 *
 * @param   fromId    - The id of the user from whom the announcement is posted
 * @param   emoji     - The emoji to respond with
 * @param   inReplyTo - The DSNP Announcement Id of the parent announcement
 * @returns A ReactionAnnouncement
 */
export const createReaction = (fromId: string, emoji: string, inReplyTo: string): ReactionAnnouncement => ({
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
 * GraphChangeAnnouncement: an Announcement of type GraphChange
 */
export interface GraphChangeAnnouncement extends TypedAnnouncement<DSNPType.GraphChange> {
  fromId: string;
  changeType: DSNPGraphChangeType;
  objectId: string;
}

/**
 * createFollowGraphChange() generates a follow graph change announcement from
 * a given DSNP user id.
 *
 * @param   fromId     - The id of the user from whom the announcement is posted
 * @param   followeeId - The id of the user to follow
 * @returns A GraphChangeAnnouncement
 */
export const createFollowGraphChange = (fromId: string, followeeId: string): GraphChangeAnnouncement => ({
  fromId,
  dsnpType: DSNPType.GraphChange,
  changeType: DSNPGraphChangeType.Follow,
  objectId: followeeId,
});

/**
 * createUnfollowGraphChange() generates an unfollow graph change announcement
 * from a given DSNP user id.
 *
 * @param   fromId     - The id of the user from whom the announcement is posted
 * @param   followeeId - The id of the user to unfollow
 * @returns A GraphChangeAnnouncement
 */
export const createUnfollowGraphChange = (fromId: string, followeeId: string): GraphChangeAnnouncement => ({
  fromId,
  dsnpType: DSNPType.GraphChange,
  changeType: DSNPGraphChangeType.Unfollow,
  objectId: followeeId,
});

/**
 * ProfileAnnouncement: an Announcement of type Profile
 */
export interface ProfileAnnouncement extends TypedAnnouncement<DSNPType.Profile> {
  contentHash: string;
  fromId: string;
  url: string;
}

/**
 * createProfile() generates a profile announcement from a given URL and hash.
 *
 * @param   fromId - The id of the user from whom the announcement is posted
 * @param   url    - The URL of the activity content to reference
 * @param   hash   - The hash of the content at the URL
 * @returns A ProfileAnnouncement
 */
export const createProfile = (fromId: string, url: string, hash: HexString): ProfileAnnouncement => ({
  dsnpType: DSNPType.Profile,
  contentHash: hash,
  fromId,
  url,
});
