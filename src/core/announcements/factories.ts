import { convertDSNPUserURIToDSNPUserId, DSNPAnnouncementURI, DSNPUserId, DSNPUserURI } from "../identifiers";
import { HexString } from "../../types/Strings";
import { createdAtOrNow } from "../utilities";

/**
 * AnnouncementType: an enum representing different types of DSNP announcements
 */
export enum AnnouncementType {
  Tombstone = 0,
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
  createdAt: BigInt;
}

/**
 * TombstoneAnnouncement: an Announcement of type Tombstone
 */
export interface TombstoneAnnouncement extends TypedAnnouncement<AnnouncementType.Tombstone> {
  targetAnnouncementType: AnnouncementType;
  targetSignature: HexString;
}

/**
 * createTombstone() generates a tombstone announcement from a given URL and
 * hash.
 *
 * @param fromURI         - The id of the user from whom the announcement is posted
 * @param targetType      - The DSNP announcement type of the target announcement
 * @param targetSignature - The signature of the target announcement
 * @param createdAt       - Optional. The createdAt timestamp of the announcement as a BigInt of milliseconds since UNIX epoch
 * @returns A TombstoneAnnouncement
 */
export const createTombstone = (
  fromURI: DSNPUserURI,
  targetType: AnnouncementType,
  targetSignature: HexString,
  createdAt?: BigInt
): TombstoneAnnouncement => ({
  announcementType: AnnouncementType.Tombstone,
  targetAnnouncementType: targetType,
  targetSignature,
  createdAt: createdAtOrNow(createdAt),
  fromId: convertDSNPUserURIToDSNPUserId(fromURI),
});

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
 * @param fromURI   - The id of the user from whom the announcement is posted
 * @param url       - The URL of the activity content to reference
 * @param hash      - The hash of the content at the URL
 * @param createdAt - Optional. The createdAt timestamp of the announcement as a BigInt of milliseconds since UNIX epoch
 * @returns A BroadcastAnnouncement
 */
export const createBroadcast = (
  fromURI: DSNPUserURI,
  url: string,
  hash: HexString,
  createdAt?: BigInt
): BroadcastAnnouncement => ({
  announcementType: AnnouncementType.Broadcast,
  contentHash: hash,
  createdAt: createdAtOrNow(createdAt),
  fromId: convertDSNPUserURIToDSNPUserId(fromURI),
  url,
});

/**
 * ReplyAnnouncement: am announcement of type Reply
 */
export interface ReplyAnnouncement extends TypedAnnouncement<AnnouncementType.Reply> {
  contentHash: HexString;
  inReplyTo: DSNPAnnouncementURI;
  url: string;
}

/**
 * createReply() generates a reply announcement from a given URL, hash and
 * announcement uri.
 *
 * @param fromURI   - The id of the user from whom the announcement is posted
 * @param url       - The URL of the activity content to reference
 * @param hash      - The hash of the content at the URL
 * @param inReplyTo - The DSNP Announcement Uri of the parent announcement
 * @param createdAt - Optional. The createdAt timestamp of the announcement as a BigInt of milliseconds since UNIX epoch
 * @returns A ReplyAnnouncement
 */
export const createReply = (
  fromURI: DSNPUserURI,
  url: string,
  hash: HexString,
  inReplyTo: DSNPAnnouncementURI,
  createdAt?: BigInt
): ReplyAnnouncement => ({
  announcementType: AnnouncementType.Reply,
  contentHash: hash,
  createdAt: createdAtOrNow(createdAt),
  fromId: convertDSNPUserURIToDSNPUserId(fromURI),
  inReplyTo,
  url,
});

/**
 * ReactionAnnouncement: an Announcement of type Reaction
 */
export interface ReactionAnnouncement extends TypedAnnouncement<AnnouncementType.Reaction> {
  emoji: string;
  inReplyTo: DSNPAnnouncementURI;
}

/**
 * createReaction() generates a reaction announcement from a given URL, hash and
 * announcement uri.
 *
 * @param fromURI   - The id of the user from whom the announcement is posted
 * @param emoji     - The emoji to respond with
 * @param inReplyTo - The DSNP Announcement Uri of the parent announcement
 * @param createdAt - Optional. The createdAt timestamp of the announcement as a BigInt of milliseconds since UNIX epoch
 * @returns A ReactionAnnouncement
 */
export const createReaction = (
  fromURI: DSNPUserURI,
  emoji: string,
  inReplyTo: DSNPAnnouncementURI,
  createdAt?: BigInt
): ReactionAnnouncement => ({
  announcementType: AnnouncementType.Reaction,
  createdAt: createdAtOrNow(createdAt),
  emoji,
  fromId: convertDSNPUserURIToDSNPUserId(fromURI),
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
}

/**
 * createFollowGraphChange() generates a follow graph change announcement from
 * a given DSNP user URI.
 *
 * @param fromURI     - The id of the user from whom the announcement is posted
 * @param followeeURI - The id of the user to follow
 * @param createdAt   - Optional. The createdAt timestamp of the announcement as a BigInt of milliseconds since UNIX epoch
 * @returns A GraphChangeAnnouncement
 */
export const createFollowGraphChange = (
  fromURI: DSNPUserURI,
  followeeURI: DSNPUserURI,
  createdAt?: BigInt
): GraphChangeAnnouncement => ({
  fromId: convertDSNPUserURIToDSNPUserId(fromURI),
  announcementType: AnnouncementType.GraphChange,
  changeType: DSNPGraphChangeType.Follow,
  createdAt: createdAtOrNow(createdAt),
  objectId: convertDSNPUserURIToDSNPUserId(followeeURI),
});

/**
 * createUnfollowGraphChange() generates an unfollow graph change announcement
 * from a given DSNP user URI.
 *
 * @param fromURI     - The id of the user from whom the announcement is posted
 * @param followeeURI - The id of the user to unfollow
 * @param createdAt   - Optional. The createdAt timestamp of the announcement as a BigInt of milliseconds since UNIX epoch
 * @returns A GraphChangeAnnouncement
 */
export const createUnfollowGraphChange = (
  fromURI: DSNPUserURI,
  followeeURI: DSNPUserURI,
  createdAt?: BigInt
): GraphChangeAnnouncement => ({
  fromId: convertDSNPUserURIToDSNPUserId(fromURI),
  announcementType: AnnouncementType.GraphChange,
  changeType: DSNPGraphChangeType.Unfollow,
  createdAt: createdAtOrNow(createdAt),
  objectId: convertDSNPUserURIToDSNPUserId(followeeURI),
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
 * @param fromURI   - The id of the user from whom the announcement is posted
 * @param url       - The URL of the activity content to reference
 * @param hash      - The hash of the content at the URL
 * @param createdAt - Optional. The createdAt timestamp of the announcement as a BigInt of milliseconds since UNIX epoch
 * @returns A ProfileAnnouncement
 */
export const createProfile = (
  fromURI: DSNPUserURI,
  url: string,
  hash: HexString,
  createdAt?: BigInt
): ProfileAnnouncement => ({
  announcementType: AnnouncementType.Profile,
  contentHash: hash,
  createdAt: createdAtOrNow(createdAt),
  fromId: convertDSNPUserURIToDSNPUserId(fromURI),
  url,
});
