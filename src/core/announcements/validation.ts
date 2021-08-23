import { ConfigOpts } from "../config";
import { Permission } from "../contracts/identity";
import { isSignatureAuthorizedTo } from "../contracts/registry";
import { SignedAnnouncement } from "./crypto";
import {
  Announcement,
  DSNPGraphChangeType,
  AnnouncementType,
  TombstoneAnnouncement,
  GraphChangeAnnouncement,
  BroadcastAnnouncement,
  ReplyAnnouncement,
  ReactionAnnouncement,
  ProfileAnnouncement,
} from "./factories";
import { isDSNPUserId, isDSNPAnnouncementURI } from "../identifiers";
import { convertSignedAnnouncementToAnnouncement } from "./services";
import { isRecord, isString, isNumber, isBigInt } from "../utilities/validation";

const SIGNATURE_REGEX = /^0x[0-9a-f]{130}$/i;
const EMOJI_REGEX = /^[\u{2000}-\u{2BFF}\u{E000}-\u{FFFF}\u{1F000}-\u{FFFFF}]+$/u;

const isValidEmoji = (obj: unknown): boolean => {
  if (!isString(obj)) return false;
  return obj.match(EMOJI_REGEX) !== null;
};

const isValidSignature = (obj: unknown): boolean => {
  if (!isString(obj)) return false;
  return obj.match(SIGNATURE_REGEX) !== null;
};

/**
 * isTombstoneableType() is helper function for checking if a particular
 * announcement type can be tombstoned.
 *
 * @param announcementType - The announcement type to check
 * @returns True if the announcement type can be tombstoned, otherwise false
 */
export const isTombstoneableType = (announcementType: AnnouncementType): boolean =>
  announcementType === AnnouncementType.Broadcast ||
  announcementType === AnnouncementType.Reply ||
  announcementType === AnnouncementType.Reaction;

/**
 * isGraphChangeType() is a type check for DSNPGraphChangeType
 *
 * @param obj - The object to check
 * @returns True if the object is a DSNPGraphChangeType, otherwise false
 */
export const isGraphChangeType = (obj: unknown): obj is DSNPGraphChangeType => {
  if (!isNumber(obj)) return false;
  return obj == DSNPGraphChangeType.Follow || obj == DSNPGraphChangeType.Unfollow;
};

/**
 * isAnnouncementType() is a type check for AnnouncementType
 *
 * @param obj - The object to check
 * @returns True if the object is a AnnouncementType, otherwise false
 */
export const isAnnouncementType = (obj: unknown): obj is AnnouncementType => {
  if (!isNumber(obj)) return false;
  return (
    obj == AnnouncementType.Tombstone ||
    obj == AnnouncementType.GraphChange ||
    obj == AnnouncementType.Broadcast ||
    obj == AnnouncementType.Reply ||
    obj == AnnouncementType.Reaction ||
    obj == AnnouncementType.Profile
  );
};

/**
 * isTombstoneAnnouncement() is a type check for TombstoneAnnouncement
 *
 * @param obj - The object to check
 * @returns True if the object is a TombstoneAnnouncement, otherwise false
 */
export const isTombstoneAnnouncement = (obj: unknown): obj is TombstoneAnnouncement => {
  if (!isRecord(obj)) return false;
  if (obj["announcementType"] != AnnouncementType.Tombstone) return false;
  if (!isDSNPUserId(obj["fromId"])) return false;
  if (!isBigInt(obj["createdAt"])) return false;
  if (!isAnnouncementType(obj["targetAnnouncementType"])) return false;
  if (!isTombstoneableType(obj["targetAnnouncementType"])) return false;
  if (!isValidSignature(obj["targetSignature"])) return false;

  return true;
};

/**
 * isGraphChangeAnnouncement() is a type check for GraphChangeAnnouncement
 *
 * @param obj - The object to check
 * @returns True if the object is a GraphChangeAnnouncement, otherwise false
 */
export const isGraphChangeAnnouncement = (obj: unknown): obj is GraphChangeAnnouncement => {
  if (!isRecord(obj)) return false;
  if (obj["announcementType"] != AnnouncementType.GraphChange) return false;
  if (!isDSNPUserId(obj["fromId"])) return false;
  if (!isGraphChangeType(obj["changeType"])) return false;
  if (!isDSNPUserId(obj["objectId"])) return false;
  if (!isBigInt(obj["createdAt"])) return false;
  return true;
};

/**
 * isBroadcastAnnouncement() is a type check for BroadcastAnnouncement
 *
 * @param obj - The object to check
 * @returns True if the object is a BroadcastAnnouncement, otherwise false
 */
export const isBroadcastAnnouncement = (obj: unknown): obj is BroadcastAnnouncement => {
  if (!isRecord(obj)) return false;
  if (obj["announcementType"] != AnnouncementType.Broadcast) return false;
  if (!isDSNPUserId(obj["fromId"])) return false;
  if (!isBigInt(obj["createdAt"])) return false;
  if (!isString(obj["url"])) return false;
  if (!isString(obj["contentHash"])) return false;

  return true;
};

/**
 * isReplyAnnouncement() is a type check for ReplyAnnouncement
 *
 * @param obj - The object to check
 * @returns True if the object is a ReplyAnnouncement, otherwise false
 */
export const isReplyAnnouncement = (obj: unknown): obj is ReplyAnnouncement => {
  if (!isRecord(obj)) return false;
  if (obj["announcementType"] != AnnouncementType.Reply) return false;
  if (!isDSNPUserId(obj["fromId"])) return false;
  if (!isBigInt(obj["createdAt"])) return false;
  if (!isString(obj["url"])) return false;
  if (!isString(obj["contentHash"])) return false;
  if (!isDSNPAnnouncementURI(obj["inReplyTo"])) return false;

  return true;
};

/**
 * isReactionAnnouncement() is a type check for ReactionAnnouncement
 *
 * @param obj - The object to check
 * @returns True if the object is a ReactionAnnouncement, otherwise false
 */
export const isReactionAnnouncement = (obj: unknown): obj is ReactionAnnouncement => {
  if (!isRecord(obj)) return false;
  if (obj["announcementType"] != AnnouncementType.Reaction) return false;
  if (!isDSNPUserId(obj["fromId"])) return false;
  if (!isBigInt(obj["createdAt"])) return false;
  if (!isValidEmoji(obj["emoji"])) return false;
  if (!isDSNPAnnouncementURI(obj["inReplyTo"])) return false;

  return true;
};

/**
 * isProfileAnnouncement() is a type check for ProfileAnnouncement
 *
 * @param obj - The object to check
 * @returns True if the object is a ProfileAnnouncement, otherwise false
 */
export const isProfileAnnouncement = (obj: unknown): obj is ProfileAnnouncement => {
  if (!isRecord(obj)) return false;
  if (obj["announcementType"] != AnnouncementType.Profile) return false;
  if (!isDSNPUserId(obj["fromId"])) return false;
  if (!isBigInt(obj["createdAt"])) return false;
  if (!isString(obj["url"])) return false;
  if (!isString(obj["contentHash"])) return false;

  return true;
};

/**
 * isAnnouncement() is a type check for Announcement
 *
 * @param obj - The object to check
 * @returns True if the object is a Announcement, otherwise false
 */
export const isAnnouncement = (obj: unknown): obj is Announcement => {
  if (!isRecord(obj)) return false;
  if (!isAnnouncementType(obj["announcementType"])) return false;

  const validators: Record<AnnouncementType, (obj: unknown) => boolean> = {
    [AnnouncementType.Tombstone]: isTombstoneAnnouncement,
    [AnnouncementType.GraphChange]: isGraphChangeAnnouncement,
    [AnnouncementType.Broadcast]: isBroadcastAnnouncement,
    [AnnouncementType.Reply]: isReplyAnnouncement,
    [AnnouncementType.Reaction]: isReactionAnnouncement,
    [AnnouncementType.Profile]: isProfileAnnouncement,
  };

  return validators[obj["announcementType"]](obj);
};

/**
 * isSignedAnnouncement() is a type check for SignedAnnouncements
 *
 * @param obj - The object to check
 * @returns True if the object is a SignedAnnouncement, otherwise false
 */
export const isSignedAnnouncement = (obj: unknown): obj is SignedAnnouncement => {
  if (!isRecord(obj)) return false;
  if (!isValidSignature(obj["signature"])) return false;

  return isAnnouncement(obj);
};

/**
 * isValidAnnouncement() validates an announcement and its associated content.
 * Note that this method only validates an announcement's signature and format.
 * It **does not** validate the authenticity of the linked activity content or
 * any file content linked within the activity content. These pieces of data
 * should be validated separately.
 *
 * @param obj - A signed announcement to validate
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns True if the announcement is valid, otherwise false
 */
export const isValidAnnouncement = async (obj: unknown, opts?: ConfigOpts): Promise<boolean> => {
  if (!isSignedAnnouncement(obj)) return false;

  if (
    !(await isSignatureAuthorizedTo(
      obj.signature,
      convertSignedAnnouncementToAnnouncement(obj),
      obj.fromId,
      Permission.ANNOUNCE,
      undefined,
      opts
    ))
  )
    return false;

  return true;
};
