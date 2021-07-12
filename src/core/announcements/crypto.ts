import { ConfigOpts, requireGetSigner } from "../../config";
import { HexString } from "../../types/Strings";
import { ethers } from "ethers";
import { Announcement, AnnouncementWithSignature } from "./announcementTypes";
import { serialize } from "./serialization";

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
