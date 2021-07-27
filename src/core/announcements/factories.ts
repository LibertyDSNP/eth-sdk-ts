import { DSNPAnnouncementId, DSNPUserId } from "../identifiers";
import { HexString } from "../../types/Strings";
import { createdAtOrNow } from "../utilities";

/**
 * AnnouncementType: an enum representing different types of DSNP announcements
 */
export enum AnnouncementType {
  GraphChange = 1,
  Broadcast = 2,
  Reply = 3,
  Reaction = 4,
  Profile = 5,
}

/**
 * Announcement: an Announcement intended for inclusion in a batch file
 */
export type Announcement = TypedAnnouncement<AnnouncementType>;

/**
 * TypedAnnouncement: an Announcement with a particular AnnouncementType
 */
export interface TypedAnnouncement<T extends AnnouncementType> {
  announcementType: T;
  fromId: DSNPUserId;
  createdAt: number;
}

/**
 * BroadcastAnnouncement: an Announcement of type Broadcast
 */
export interface BroadcastAnnouncement extends TypedAnnouncement<AnnouncementType.Broadcast> {
  contentHash: HexString;
  url: string;
}

/**
 * createBroadcast() generates a broadcast announcement from a given URL and
 * hash.
 *
 * @param fromId    - The id of the user from whom the announcement is posted
 * @param url       - The URL of the activity content to reference
 * @param hash      - The hash of the content at the URL
 * @param createdAt - Optional. The createdAt timestamp of the announcement as number of milliseconds since UNIX epoch
 * @returns A BroadcastAnnouncement
 */
export const createBroadcast = (
  fromId: DSNPUserId,
  url: string,
  hash: HexString,
  createdAt?: number
): BroadcastAnnouncement => ({
  announcementType: AnnouncementType.Broadcast,
  contentHash: hash,
  createdAt: createdAtOrNow(createdAt),
  fromId,
  url,
});

/**
 * ReplyAnnouncement: am announcement of type Reply
 */
export interface ReplyAnnouncement extends TypedAnnouncement<AnnouncementType.Reply> {
  contentHash: HexString;
  inReplyTo: DSNPAnnouncementId;
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
 * @param createdAt - Optional. The createdAt timestamp of the announcement as number of milliseconds since UNIX epoch
 * @returns A ReplyAnnouncement
 */
export const createReply = (
  fromId: DSNPUserId,
  url: string,
  hash: HexString,
  inReplyTo: DSNPAnnouncementId,
  createdAt?: number
): ReplyAnnouncement => ({
  announcementType: AnnouncementType.Reply,
  contentHash: hash,
  createdAt: createdAtOrNow(createdAt),
  fromId,
  inReplyTo,
  url,
});

/**
 * ReactionAnnouncement: an Announcement of type Reaction
 */
export interface ReactionAnnouncement extends TypedAnnouncement<AnnouncementType.Reaction> {
  emoji: string;
  inReplyTo: DSNPAnnouncementId;
}

/**
 * createReaction() generates a reaction announcement from a given URL, hash and
 * announcement identifier.
 *
 * @param fromId    - The id of the user from whom the announcement is posted
 * @param emoji     - The emoji to respond with
 * @param inReplyTo - The DSNP Announcement Id of the parent announcement
 * @param createdAt - Optional. The createdAt timestamp of the announcement as number of milliseconds since UNIX epoch
 * @returns A ReactionAnnouncement
 */
export const createReaction = (
  fromId: DSNPUserId,
  emoji: string,
  inReplyTo: DSNPAnnouncementId,
  createdAt?: number
): ReactionAnnouncement => ({
  announcementType: AnnouncementType.Reaction,
  createdAt: createdAtOrNow(createdAt),
  emoji,
  fromId,
  inReplyTo,
});

/**
 * DSNPGraphChangeType: an enum representing different types of graph changes
 */
export enum DSNPGraphChangeType {
  Unfollow = 0,
  Follow = 1,
}

/**
 * GraphChangeAnnouncement: an Announcement of type GraphChange
 */
export interface GraphChangeAnnouncement extends TypedAnnouncement<AnnouncementType.GraphChange> {
  changeType: DSNPGraphChangeType;
  objectId: DSNPUserId;
  createdAt: number;
}

/**
 * createFollowGraphChange() generates a follow graph change announcement from
 * a given DSNP user id.
 *
 * @param fromId     - The id of the user from whom the announcement is posted
 * @param followeeId - The id of the user to follow
 * @param createdAt  - Optional. The createdAt timestamp of the announcement as number of milliseconds since UNIX epoch
 * @returns A GraphChangeAnnouncement
 */
export const createFollowGraphChange = (
  fromId: DSNPUserId,
  followeeId: DSNPUserId,
  createdAt?: number
): GraphChangeAnnouncement => ({
  fromId,
  announcementType: AnnouncementType.GraphChange,
  changeType: DSNPGraphChangeType.Follow,
  createdAt: createdAtOrNow(createdAt),
  objectId: followeeId,
});

/**
 * createUnfollowGraphChange() generates an unfollow graph change announcement
 * from a given DSNP user id.
 *
 * @param fromId     - The id of the user from whom the announcement is posted
 * @param followeeId - The id of the user to unfollow
 * @param createdAt  - Optional. The createdAt timestamp of the announcement as number of milliseconds since UNIX epoch
 * @returns A GraphChangeAnnouncement
 */
export const createUnfollowGraphChange = (
  fromId: DSNPUserId,
  followeeId: DSNPUserId,
  createdAt?: number
): GraphChangeAnnouncement => ({
  fromId,
  announcementType: AnnouncementType.GraphChange,
  changeType: DSNPGraphChangeType.Unfollow,
  createdAt: createdAtOrNow(createdAt),
  objectId: followeeId,
});

/**
 * ProfileAnnouncement: an Announcement of type Profile
 */
export interface ProfileAnnouncement extends TypedAnnouncement<AnnouncementType.Profile> {
  contentHash: HexString;
  url: string;
}

/**
 * createProfile() generates a profile announcement from a given URL and hash.
 *
 * @param fromId    - The id of the user from whom the announcement is posted
 * @param url       - The URL of the activity content to reference
 * @param hash      - The hash of the content at the URL
 * @param createdAt - Optional. The createdAt timestamp of the announcement as number of milliseconds since UNIX epoch
 * @returns A ProfileAnnouncement
 */
export const createProfile = (
  fromId: DSNPUserId,
  url: string,
  hash: HexString,
  createdAt?: number
): ProfileAnnouncement => ({
  announcementType: AnnouncementType.Profile,
  contentHash: hash,
  createdAt: createdAtOrNow(createdAt),
  fromId,
  url,
});
