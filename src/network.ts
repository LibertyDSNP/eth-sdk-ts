import { Registration } from "./core/contracts/registry";
import * as messages from "./core/messages/messages";
import * as config from "./config";
import { NotImplementedError } from "./core/utilities";
import { DSNPUserId } from "./core/utilities/identifiers";
import { BatchGraphChangeMessage } from "./core/batch/batchMesssages";

/**
 * follow() creates a follow event and returns it.
 *
 * @param followeeId - The id of the user to follow
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns The signed DSNP Graph Change message
 */
export const follow = async (followeeId: DSNPUserId, opts?: config.ConfigOpts): Promise<BatchGraphChangeMessage> => {
  const currentFromId = config.requireGetCurrentFromId(opts);

  const message = messages.createFollowGraphChangeMessage(currentFromId, followeeId);

  const signedMessage = await messages.sign(message, opts);
  return signedMessage;
};

/**
 * unfollow() creates an unfollow event and returns it.
 *
 * @param followeeId - The id of the user to unfollow
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns The signed DSNP Graph Change message
 */
export const unfollow = async (followeeId: DSNPUserId, opts?: config.ConfigOpts): Promise<BatchGraphChangeMessage> => {
  const currentFromId = config.requireGetCurrentFromId(opts);

  const message = messages.createFollowGraphChangeMessage(currentFromId, followeeId);

  const signedMessage = await messages.sign(message, opts);
  return signedMessage;
};

/**
 * isFollowing() scans the current state of the network and returns a boolean
 * representing whether or not a given user is following another given user.
 * This method is not yet implemented.
 *
 * @param follower - The id of the follower
 * @param followee - Optional. The id of the following user. Defaults to current user.
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A boolean representing whether or not the follower is following the followee
 */
export const isFollowing = async (
  _follower: DSNPUserId,
  _followee?: DSNPUserId,
  _opts?: config.ConfigOpts
): Promise<boolean> => {
  throw NotImplementedError;
};

/**
 * getFollowers() scans the current state of the network and returns an array of
 * all users following the given followee handle. This method is not yet
 * implemented.
 *
 * @param followee - Optional. The followee id to fetch followers for. Defaults to the current user.
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns        An array of all users following the followee
 */
export const getFollowers = async (_followee?: DSNPUserId, _opts?: config.ConfigOpts): Promise<Registration[]> => {
  throw NotImplementedError;
};

/**
 * getFollowees() scans the current state of the network and returns an array of
 * all users being followed by the given follower handle. This method is not yet
 * implemented.
 *
 * @param follower - Optional. The follower id to fetch followees for. Defaults to the current user.
 * @param opts -     Optional. Configuration overrides, such as from address, if any
 * @returns        An array of all users followed by the follower user
 */
export const getFollowees = (_follower?: DSNPUserId, _opts?: config.ConfigOpts): Promise<Registration[]> => {
  throw NotImplementedError;
};
