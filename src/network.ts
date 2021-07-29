import { ConfigOpts, requireGetCurrentFromURI } from "./core/config";
import { DSNPUserURI } from "./core/identifiers";
import {
  createFollowGraphChange,
  createUnfollowGraphChange,
  sign,
  SignedGraphChangeAnnouncement,
} from "./core/announcements";

/**
 * follow() creates a follow event and returns it.
 *
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingFromIdConfigError}
 * Thrown if the from id is not configured.
 * @param followeeURI - The id of the user to follow
 * @param opts        - Optional. Configuration overrides, such as from address, if any
 * @returns The signed Graph Change Announcement
 */
export const follow = async (followeeURI: DSNPUserURI, opts?: ConfigOpts): Promise<SignedGraphChangeAnnouncement> => {
  const currentFromURI = requireGetCurrentFromURI(opts);

  const announcement = createFollowGraphChange(currentFromURI, followeeURI);

  const signedAnnouncement = await sign(announcement, opts);
  return signedAnnouncement;
};

/**
 * unfollow() creates an unfollow event and returns it.
 *
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingFromIdConfigError}
 * Thrown if the from id is not configured.
 * @param followeeURI - The id of the user to unfollow
 * @param opts        - Optional. Configuration overrides, such as from address, if any
 * @returns The signed Graph Change Announcement
 */
export const unfollow = async (followeeURI: DSNPUserURI, opts?: ConfigOpts): Promise<SignedGraphChangeAnnouncement> => {
  const currentFromURI = requireGetCurrentFromURI(opts);

  const announcement = createUnfollowGraphChange(currentFromURI, followeeURI);

  const signedAnnouncement = await sign(announcement, opts);
  return signedAnnouncement;
};
