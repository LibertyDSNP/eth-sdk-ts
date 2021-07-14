import { keccak256 } from "js-sha3";

import {
  create,
  isValid,
  isValidProfile,
  isValidReply,
  serialize,
  ActivityPubOpts,
  InvalidActivityPubError,
} from "./core/activityPub";
import * as config from "./config";
import { validateDSNPAnnouncementId, InvalidAnnouncementIdentifierError } from "./core/identifiers";
import { requireGetStore } from "./config";
import * as announcements from "./core/announcements";
import {
  SignedBroadcastAnnouncement,
  SignedProfileAnnouncement,
  SignedReactionAnnouncement,
  SignedReplyAnnouncement,
} from "./core/announcements";

/**
 * broadcast() creates an activity pub file with the given content options,
 * uploads it with a random filename using the configured storage adapter and
 * creates a broadcast announcement for the hosted file for later publishing.
 *
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingStoreConfigError}
 * Thrown if the store is not configured.
 * @throws {@link MissingFromIdConfigError}
 * Thrown if the from id is not configured.
 * @throws {@link InvalidActivityPubError}
 * Thrown if the provided activity pub object is not valid.
 * @param contentOptions - Options for the activity pub content to generate
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A Signed Broadcast announcement ready for inclusion in a batch
 */
export const broadcast = async (
  contentOptions: ActivityPubOpts,
  opts?: config.ConfigOpts
): Promise<SignedBroadcastAnnouncement> => {
  const contentObj = create(contentOptions);
  if (!isValid(contentObj)) throw new InvalidActivityPubError();
  const content = serialize(contentObj);

  const currentFromId = config.requireGetCurrentFromId(opts);

  const contentHash = keccak256(content);
  const store = requireGetStore(opts);
  const url = await store.put(contentHash, content);

  const announcement = announcements.createBroadcast(currentFromId, url.toString(), contentHash);

  const signedAnnouncement = await announcements.sign(announcement, opts);
  return signedAnnouncement;
};

/**
 * reply() creates an activity pub file with the given content options,
 * uploads it with a random filename using the configured storage adapter and
 * creates a reply announcement for the hosted file for later publishing.
 *
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingStoreConfigError}
 * Thrown if the store is not configured.
 * @throws {@link MissingFromIdConfigError}
 * Thrown if the from id is not configured.
 * @throws {@link InvalidActivityPubError}
 * Thrown if the provided activity pub object is not valid.
 * @throws {@link InvalidAnnouncementIdentifierError}
 * Thrown if the provided inReplyTo Announcement Id is invalid.
 * @param contentOptions - Options for the activity pub content to generate
 * @param inReplyTo - The DSNP Announcement Id of the announcement that this announcement is in reply to
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A Signed Reply Announcement ready for inclusion in a batch
 */
export const reply = async (
  contentOptions: ActivityPubOpts,
  inReplyTo: string,
  opts?: config.ConfigOpts
): Promise<SignedReplyAnnouncement> => {
  if (!validateDSNPAnnouncementId(inReplyTo)) throw new InvalidAnnouncementIdentifierError(inReplyTo);

  const contentObj = create(contentOptions);
  if (!isValidReply(contentObj)) throw new InvalidActivityPubError();
  const content = serialize(contentObj);

  const currentFromId = config.requireGetCurrentFromId(opts);

  const contentHash = keccak256(content);
  const store = requireGetStore(opts);
  const url = await store.put(contentHash, content);

  const announcement = announcements.createReply(currentFromId, url.toString(), contentHash, inReplyTo);

  const signedAnnouncement = await announcements.sign(announcement, opts);
  return signedAnnouncement;
};

/**
 * react() creates a reaction announcement for later publishing.
 *
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingFromIdConfigError}
 * Thrown if the from id is not configured.
 * @throws {@link InvalidAnnouncementIdentifierError}
 * Thrown if the provided inReplyTo DSNP Message Id is invalid.
 * @param emoji - The emoji with which to react
 * @param inReplyTo - The DSNP Announcement Id of the announcement to which to react
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A Signed Reaction Announcement ready for inclusion in a batch
 */
export const react = async (
  emoji: string,
  inReplyTo: string,
  opts?: config.ConfigOpts
): Promise<SignedReactionAnnouncement> => {
  const currentFromId = config.requireGetCurrentFromId(opts);

  const announcement = announcements.createReaction(currentFromId, emoji, inReplyTo);

  const signedAnnouncement = await announcements.sign(announcement, opts);
  return signedAnnouncement;
};

/**
 * profile() creates an activity pub file with the given content options,
 * uploads it with a random filename using the configured storage adapter and
 * creates a profile announcement for the hosted file for later publishing.
 *
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingStoreConfigError}
 * Thrown if the store is not configured.
 * @throws {@link MissingFromIdConfigError}
 * Thrown if the from id is not configured.
 * @throws {@link InvalidActivityPubError}
 * Thrown if the provided activity pub object is not valid.
 * @param contentOptions - Options for the activity pub content to generate
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A Signed Profile Announcement ready for inclusion in a batch
 */
export const profile = async (
  contentOptions: ActivityPubOpts,
  opts?: config.ConfigOpts
): Promise<SignedProfileAnnouncement> => {
  const contentObj = create(contentOptions);
  if (!isValidProfile(contentObj)) throw new InvalidActivityPubError();
  const content = serialize(contentObj);

  const currentFromId = config.requireGetCurrentFromId(opts);

  const contentHash = keccak256(content);
  const store = requireGetStore(opts);
  const url = await store.put(contentHash, content);

  const announcement = announcements.createProfile(currentFromId, url.toString(), contentHash);

  const signedAnnouncement = await announcements.sign(announcement, opts);
  return signedAnnouncement;
};
