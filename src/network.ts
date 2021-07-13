import { ConfigOpts, requireGetCurrentFromId } from "./config";
import { DSNPUserId } from "./core/identifiers";
import {
  createFollowGraphChange,
  createUnfollowGraphChange,
  sign,
  SignedGraphChangeAnnouncement,
} from "./core/announcements";
import { NotImplementedError } from "./core/errors";
import { DSNPUserId } from "./core/identifiers";
import { Registration } from "./core/contracts/registry";

/**
 * follow() creates a follow event and returns it.
 *
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingFromIdConfigError}
 * Thrown if the from id is not configured.
 * @param followeeId - The id of the user to follow
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns The signed Graph Change Announcement
 */
export const follow = async (followeeId: DSNPUserId, opts?: ConfigOpts): Promise<SignedGraphChangeAnnouncement> => {
  const currentFromId = requireGetCurrentFromId(opts);

  const announcement = createFollowGraphChange(currentFromId, followeeId);

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
 * @param followeeId - The id of the user to unfollow
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns The signed Graph Change Announcement
 */
export const unfollow = async (followeeId: DSNPUserId, opts?: ConfigOpts): Promise<SignedGraphChangeAnnouncement> => {
  const currentFromId = requireGetCurrentFromId(opts);

  const announcement = createUnfollowGraphChange(currentFromId, followeeId);

  const signedAnnouncement = await sign(announcement, opts);
  return signedAnnouncement;
};
