import { ConfigOpts, requireGetSigner } from "../config";
import { HexString } from "../../types/Strings";
import { ethers } from "ethers";
import {
  Announcement,
  BroadcastAnnouncement,
  GraphChangeAnnouncement,
  ProfileAnnouncement,
  ReactionAnnouncement,
  ReplyAnnouncement,
} from "./factories";
import { serialize } from "./serialization";

/**
 * A Generic Signed Announcement ready for inclusion in a Batch File
 * {@link Announcement}
 */
export type AnnouncementWithSignature<T extends Announcement> = T & { signature: HexString };

/**
 * A Signed Announcement ready for inclusion in a Batch File
 * {@link Announcement}
 */
export type SignedAnnouncement = AnnouncementWithSignature<Announcement>;

/**
 * A Signed Broadcast Announcement ready for inclusion in a Batch File
 * {@link BroadcastAnnouncement}
 */
export type SignedBroadcastAnnouncement = AnnouncementWithSignature<BroadcastAnnouncement>;

/**
 * A Signed Reply Announcement ready for inclusion in a Batch File
 * {@link ReplyAnnouncement}
 */
export type SignedReplyAnnouncement = AnnouncementWithSignature<ReplyAnnouncement>;

/**
 * A Signed Reaction Announcement ready for inclusion in a Batch File
 * {@link ReactionAnnouncement}
 */
export type SignedReactionAnnouncement = AnnouncementWithSignature<ReactionAnnouncement>;

/**
 * A Signed Profile Announcement ready for inclusion in a Batch File
 * {@link ProfileAnnouncement}
 */
export type SignedProfileAnnouncement = AnnouncementWithSignature<ProfileAnnouncement>;

/**
 * A Signed Graph Change Announcement ready for inclusion in a Batch File
 * {@link GraphChangeAnnouncement}
 */
export type SignedGraphChangeAnnouncement = AnnouncementWithSignature<GraphChangeAnnouncement>;

/**
 * sign() takes an Announcement and returns a Signed Announcement ready for
 * inclusion in a batch.
 *
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @param announcement - The announcement to sign
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns The signed announcement
 */
export const sign = async <T extends Announcement>(
  announcement: T,
  opts?: ConfigOpts
): Promise<AnnouncementWithSignature<T>> => {
  const signer = requireGetSigner(opts);
  const signature = await signer.signMessage(serialize(announcement));
  return {
    ...announcement,
    signature,
  };
};

/**
 * recoverPublicKey() takes an Announcement and an Announcement signature and returns
 * the corresponding public key for validation.
 *
 * @param announcement - The announcement that was signed
 * @param signature - The announcement signature to validate
 * @returns The address of the signer in hex
 */
export const recoverPublicKey = (announcement: Announcement, signature: HexString): HexString => {
  return ethers.utils.verifyMessage(serialize(announcement), signature);
};
