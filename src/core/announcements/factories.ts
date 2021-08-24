import { convertToDSNPUserId, DSNPAnnouncementURI, DSNPUserId, DSNPUserURI } from "../identifiers";
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
export type TypedAnnouncement<T extends AnnouncementType> = {
  announcementType: T;
  fromId: DSNPUserId;
  createdAt: bigint;
} & (TombstoneFields | BroadcastFields | ReplyFields | ReactionFields | GraphChangeFields | ProfileFields);

type TombstoneFields = {
  announcementType: AnnouncementType.Tombstone;
  targetAnnouncementType: AnnouncementType;
  targetSignature: HexString;
};

type BroadcastFields = {
  announcementType: AnnouncementType.Broadcast;
  contentHash: HexString;
  url: string;
};

type ReplyFields = {
  announcementType: AnnouncementType.Reply;
  contentHash: HexString;
  inReplyTo: DSNPAnnouncementURI;
  url: string;
};

type ReactionFields = {
  announcementType: AnnouncementType.Reaction;
  emoji: string;
  inReplyTo: DSNPAnnouncementURI;
};

type GraphChangeFields = {
  announcementType: AnnouncementType.GraphChange;
  changeType: DSNPGraphChangeType;
  objectId: DSNPUserId;
};

type ProfileFields = {
  announcementType: AnnouncementType.Profile;
  contentHash: HexString;
  url: string;
};

/**
 * TombstoneAnnouncement: an Announcement of type Tombstone
 */
export type TombstoneAnnouncement = TypedAnnouncement<AnnouncementType.Tombstone>;

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
  createdAt?: bigint
): TombstoneAnnouncement => ({
  announcementType: AnnouncementType.Tombstone,
  targetAnnouncementType: targetType,
  targetSignature,
  createdAt: createdAtOrNow(createdAt),
  fromId: convertToDSNPUserId(fromURI),
});

/**
 * BroadcastAnnouncement: an Announcement of type Broadcast
 */
export type BroadcastAnnouncement = TypedAnnouncement<AnnouncementType.Broadcast>;

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
  createdAt?: bigint
): BroadcastAnnouncement => ({
  announcementType: AnnouncementType.Broadcast,
  contentHash: hash,
  createdAt: createdAtOrNow(createdAt),
  fromId: convertToDSNPUserId(fromURI),
  url,
});

/**
 * ReplyAnnouncement: am announcement of type Reply
 */
export type ReplyAnnouncement = TypedAnnouncement<AnnouncementType.Reply>;

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
  createdAt?: bigint
): ReplyAnnouncement => ({
  announcementType: AnnouncementType.Reply,
  contentHash: hash,
  createdAt: createdAtOrNow(createdAt),
  fromId: convertToDSNPUserId(fromURI),
  inReplyTo,
  url,
});

/**
 * ReactionAnnouncement: an Announcement of type Reaction
 */
export type ReactionAnnouncement = TypedAnnouncement<AnnouncementType.Reaction>;

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
  createdAt?: bigint
): ReactionAnnouncement => ({
  announcementType: AnnouncementType.Reaction,
  createdAt: createdAtOrNow(createdAt),
  emoji,
  fromId: convertToDSNPUserId(fromURI),
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
export type GraphChangeAnnouncement = TypedAnnouncement<AnnouncementType.GraphChange>;

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
  createdAt?: bigint
): GraphChangeAnnouncement => ({
  announcementType: AnnouncementType.GraphChange,
  changeType: DSNPGraphChangeType.Follow,
  createdAt: createdAtOrNow(createdAt),
  fromId: convertToDSNPUserId(fromURI),
  objectId: convertToDSNPUserId(followeeURI),
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
  createdAt?: bigint
): GraphChangeAnnouncement => ({
  announcementType: AnnouncementType.GraphChange,
  changeType: DSNPGraphChangeType.Unfollow,
  createdAt: createdAtOrNow(createdAt),
  fromId: convertToDSNPUserId(fromURI),
  objectId: convertToDSNPUserId(followeeURI),
});

/**
 * ProfileAnnouncement: an Announcement of type Profile
 */
export type ProfileAnnouncement = TypedAnnouncement<AnnouncementType.Profile>;

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
  createdAt?: bigint
): ProfileAnnouncement => ({
  announcementType: AnnouncementType.Profile,
  contentHash: hash,
  createdAt: createdAtOrNow(createdAt),
  fromId: convertToDSNPUserId(fromURI),
  url,
});
