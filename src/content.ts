import { requireGetCurrentFromId, requireGetStore, ConfigOpts } from "./core/config";
import {
  isValidActivityContent,
  serialize,
  ActivityContent,
  ActivityContentProfile,
  InvalidActivityContentError,
} from "./core/activityContent";
import {
  createBroadcast,
  createProfile,
  createReaction,
  createReply,
  sign,
  SignedBroadcastAnnouncement,
  SignedProfileAnnouncement,
  SignedReactionAnnouncement,
  SignedReplyAnnouncement,
} from "./core/announcements";
import { isDSNPAnnouncementId, DSNPAnnouncementId, InvalidAnnouncementIdentifierError } from "./core/identifiers";
import { hash } from "./core/utilities";

/**
 * broadcast() creates an activity content file with the given content options,
 * uploads it with a random filename using the configured storage adapter and
 * creates a broadcast announcement for the hosted file for later publishing.
 *
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingStoreConfigError}
 * Thrown if the store is not configured.
 * @throws {@link MissingFromIdConfigError}
 * Thrown if the from id is not configured.
 * @throws {@link InvalidActivityContentError}
 * Thrown if the provided activity content object is not valid.
 * @param contentObject - The activity content object to broadcast
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A Signed Broadcast announcement ready for inclusion in a batch
 */
export const broadcast = async (
  contentObject: ActivityContent,
  opts?: ConfigOpts
): Promise<SignedBroadcastAnnouncement> => {
  if (!isValidActivityContent(contentObject)) throw new InvalidActivityContentError();
  const content = serialize(contentObject);

  const currentFromId = requireGetCurrentFromId(opts);

  const contentHash = hash(content);
  const store = requireGetStore(opts);
  const url = await store.putStream(contentHash, async ({ write, end }) => {
    write(content);
    end();
  });

  const announcement = createBroadcast(currentFromId, url.toString(), contentHash);

  const signedAnnouncement = await sign(announcement, opts);
  return signedAnnouncement;
};

/**
 * reply() creates an activity content file with the given content options,
 * uploads it with a random filename using the configured storage adapter and
 * creates a reply announcement for the hosted file for later publishing.
 *
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingStoreConfigError}
 * Thrown if the store is not configured.
 * @throws {@link MissingFromIdConfigError}
 * Thrown if the from id is not configured.
 * @throws {@link InvalidActivityContentError}
 * Thrown if the provided activity content object is not valid.
 * @throws {@link InvalidAnnouncementIdentifierError}
 * Thrown if the provided inReplyTo Announcement Id is invalid.
 * @param contentObject - The activity content object with which to reply
 * @param inReplyTo - The DSNP Announcement Id of the announcement that this announcement is in reply to
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A Signed Reply Announcement ready for inclusion in a batch
 */
export const reply = async (
  contentObject: ActivityContent,
  inReplyTo: DSNPAnnouncementId,
  opts?: ConfigOpts
): Promise<SignedReplyAnnouncement> => {
  if (!isDSNPAnnouncementId(inReplyTo)) throw new InvalidAnnouncementIdentifierError(inReplyTo);

  if (!isValidActivityContent(contentObject)) throw new InvalidActivityContentError();
  const content = serialize(contentObject);

  const currentFromId = requireGetCurrentFromId(opts);

  const contentHash = hash(content);
  const store = requireGetStore(opts);
  const url = await store.putStream(contentHash, async ({ write, end }) => {
    write(content);
    end();
  });

  const announcement = createReply(currentFromId, url.toString(), contentHash, inReplyTo);

  const signedAnnouncement = await sign(announcement, opts);
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
  inReplyTo: DSNPAnnouncementId,
  opts?: ConfigOpts
): Promise<SignedReactionAnnouncement> => {
  const currentFromId = requireGetCurrentFromId(opts);

  const announcement = createReaction(currentFromId, emoji, inReplyTo);

  const signedAnnouncement = await sign(announcement, opts);
  return signedAnnouncement;
};

/**
 * profile() creates an activity content file with the given content options,
 * uploads it with a random filename using the configured storage adapter and
 * creates a profile announcement for the hosted file for later publishing.
 *
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingStoreConfigError}
 * Thrown if the store is not configured.
 * @throws {@link MissingFromIdConfigError}
 * Thrown if the from id is not configured.
 * @throws {@link InvalidActivityContentError}
 * Thrown if the provided activity content object is not valid.
 * @param contentObject - The activity content profile to publish
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A Signed Profile Announcement ready for inclusion in a batch
 */
export const profile = async (
  contentObject: ActivityContentProfile,
  opts?: ConfigOpts
): Promise<SignedProfileAnnouncement> => {
  if (!isValidActivityContent(contentObject)) throw new InvalidActivityContentError();
  const content = serialize(contentObject);

  const currentFromId = requireGetCurrentFromId(opts);

  const contentHash = hash(content);
  const store = requireGetStore(opts);
  const url = await store.putStream(contentHash, async ({ write, end }) => {
    write(content);
    end();
  });

  const announcement = createProfile(currentFromId, url.toString(), contentHash);

  const signedAnnouncement = await sign(announcement, opts);
  return signedAnnouncement;
};
