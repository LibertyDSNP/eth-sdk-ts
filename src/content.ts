import { requireGetCurrentFromURI, requireGetStore, ConfigOpts } from "./core/config";
import { requireValidActivityContentNote, requireValidActivityContentProfile } from "@dsnp/activity-content/validation";
import { ActivityContentNote, ActivityContentProfile } from "@dsnp/activity-content/factories";
import {
  createBroadcast,
  createProfile,
  createReaction,
  createReply,
  createTombstone,
  isTombstoneableType,
  isValidEmoji,
  isValidSignature,
  sign,
  InvalidEmojiStringError,
  InvalidTombstoneAnnouncementTypeError,
  InvalidTombstoneAnnouncementSignatureError,
  SignedBroadcastAnnouncement,
  SignedProfileAnnouncement,
  SignedReactionAnnouncement,
  SignedReplyAnnouncement,
  SignedTombstoneAnnouncement,
} from "./core/announcements";
import { isDSNPContentURI, DSNPContentURI, InvalidContentUriError } from "./core/identifiers";
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
  contentObject: ActivityContentNote,
  opts?: ConfigOpts
): Promise<SignedBroadcastAnnouncement> => {
  requireValidActivityContentNote(contentObject);
  const content = JSON.stringify(contentObject);

  const currentFromURI = requireGetCurrentFromURI(opts);

  const contentHash = hash(content);
  const store = requireGetStore(opts);
  const url = await store.putStream(contentHash, async (writeStream) => {
    writeStream.write(content);
    writeStream.end();
  });

  const announcement = createBroadcast(currentFromURI, url.toString(), contentHash);

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
 * @throws {@link InvalidContentUriError}
 * Thrown if the provided inReplyTo Content Uri is invalid.
 * @param contentObject - The activity content object with which to reply
 * @param inReplyTo - The DSNP Content Uri of the announcement that this announcement is in reply to
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A Signed Reply Announcement ready for inclusion in a batch
 */
export const reply = async (
  contentObject: ActivityContentNote,
  inReplyTo: DSNPContentURI,
  opts?: ConfigOpts
): Promise<SignedReplyAnnouncement> => {
  if (!isDSNPContentURI(inReplyTo)) throw new InvalidContentUriError(inReplyTo);

  requireValidActivityContentNote(contentObject);
  const content = JSON.stringify(contentObject);

  const currentFromURI = requireGetCurrentFromURI(opts);

  const contentHash = hash(content);
  const store = requireGetStore(opts);
  const url = await store.putStream(contentHash, async (writeStream) => {
    writeStream.write(content);
    writeStream.end();
  });

  const announcement = createReply(currentFromURI, url.toString(), contentHash, inReplyTo);

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
 * @throws {@link InvalidContentUriError}
 * Thrown if the provided inReplyTo DSNP Message Id is invalid.
 * @throws {@link InvalidEmojiStringError}
 * Thrown if the emoji provided is invalid.
 * @param emoji - The emoji with which to react
 * @param inReplyTo - The DSNP Content Uri of the announcement to which to react
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A Signed Reaction Announcement ready for inclusion in a batch
 */
export const react = async (
  emoji: string,
  inReplyTo: DSNPContentURI,
  opts?: ConfigOpts
): Promise<SignedReactionAnnouncement> => {
  if (!isDSNPContentURI(inReplyTo)) throw new InvalidContentUriError(inReplyTo);
  if (!isValidEmoji(emoji)) throw new InvalidEmojiStringError(emoji);

  const currentFromURI = requireGetCurrentFromURI(opts);

  const announcement = createReaction(currentFromURI, emoji, inReplyTo);

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
  requireValidActivityContentProfile(contentObject);
  const content = JSON.stringify(contentObject);

  const currentFromURI = requireGetCurrentFromURI(opts);

  const contentHash = hash(content);
  const store = requireGetStore(opts);
  const url = await store.putStream(contentHash, async (writeStream) => {
    writeStream.write(content);
    writeStream.end();
  });

  const announcement = createProfile(currentFromURI, url.toString(), contentHash);

  const signedAnnouncement = await sign(announcement, opts);
  return signedAnnouncement;
};

/**
 * tombstone() creates a tombstone announcement for later publishing.
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingFromIdConfigError}
 * Thrown if the from id is not configured.
 * @throws {@link InvalidContentUriError}
 * Thrown if the provided inReplyTo DSNP Message Id is invalid.
 * @throws {@link InvalidTombstoneAnnouncementTypeError}
 * Thrown if the target type provided for the tombstone is invalid.
 * @throws {@link InvalidTombstoneAnnouncementSignatureError}
 * Thrown if the target signature provided for the tombstone is invalid.
 * @param target - The DSNP Announcement to tombstone
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A Signed Tombstone Announcement ready for inclusion in a batch
 */
export const tombstone = async (
  target: SignedBroadcastAnnouncement | SignedReplyAnnouncement | SignedReactionAnnouncement,
  opts?: ConfigOpts
): Promise<SignedTombstoneAnnouncement> => {
  if (!isTombstoneableType(target.announcementType))
    throw new InvalidTombstoneAnnouncementTypeError(target.announcementType);
  if (!isValidSignature(target.signature)) throw new InvalidTombstoneAnnouncementSignatureError(target.signature);

  const currentFromURI = requireGetCurrentFromURI(opts);

  const announcement = createTombstone(currentFromURI, target.announcementType, target.signature);
  const signedAnnouncement = await sign(announcement, opts);

  return signedAnnouncement;
};
