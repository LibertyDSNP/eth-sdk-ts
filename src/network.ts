import { Registration } from "./core/contracts/registry";
import { ConfigOpts, requireGetCurrentFromId } from "./config";
import { DSNPUserId } from "./core/identifiers";
import { NotImplementedError } from "./core/errors";
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

/**
 * isFollowing() scans the current state of the network and returns a boolean
 * representing whether or not a given user is following another given user.
 * This method is not yet implemented.
 *
 * @param _follower - The id of the follower
 * @param _followee - Optional. The id of the following user. Defaults to current user.
 * @param _opts - Optional. Configuration overrides, such as from address, if any
 * @returns A boolean representing whether or not the follower is following the followee
 */
export const isFollowing = async (
  _follower: DSNPUserId,
  _followee?: DSNPUserId,
  _opts?: ConfigOpts
): Promise<boolean> => {
  throw new NotImplementedError();
};

/**
 * getFollowers() scans the current state of the network and returns an array of
 * all users following the given followee handle. This method is not yet
 * implemented.
 *
 * @param _followee - Optional. The followee id to fetch followers for. Defaults to the current user.
 * @param _opts - Optional. Configuration overrides, such as from address, if any
 * @returns An array of all users following the followee
 */
export const getFollowers = async (_followee?: DSNPUserId, _opts?: ConfigOpts): Promise<Registration[]> => {
  throw new NotImplementedError();
};

/**
 * getFollowees() scans the current state of the network and returns an array of
 * all users being followed by the given follower handle. This method is not yet
 * implemented.
 *
 * @param _follower - Optional. The follower id to fetch followees for. Defaults to the current user.
 * @param _opts -     Optional. Configuration overrides, such as from address, if any
 * @returns An array of all users followed by the follower user
 */
export const getFollowees = (_follower?: DSNPUserId, _opts?: ConfigOpts): Promise<Registration[]> => {
  throw new NotImplementedError();
};
