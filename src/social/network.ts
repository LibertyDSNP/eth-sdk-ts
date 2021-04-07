import { Handle } from "./handles";
import { Config } from "../config/config";

/**
 * follow() creates a follow event and enqueues it for the next batch. This
 * method is not yet implemented.
 *
 * @param handle  The handle of the user to follow
 * @param opts    Optional. Configuration overrides, such as from address, if any
 */
export const follow = async (handle: Handle, opts?: Config) => {
  throw NotImplementedError();
};

/**
 * unfollow() creates an unfollow event and enqueues it for the next batch.
 * This method is not yet implemented.
 *
 * @param handle  The handle of the user to unfollow
 * @param opts    Optional. Configuration overrides, such as from address, if any
 */
export const unfollow = async (handle: Handle, opts?: Config) => {
  throw NotImplementedError();
};

/**
 * isFollowing() scans the current state of the network and returns a boolean
 * representing whether or not a given user is following another given user.
 * This method is not yet implemented.
 *
 * @param follower The handle of the user to unfollow
 * @param followee Optional. The following user. Defaults to current user.
 * @param opts     Optional. Configuration overrides, such as from address, if any
 * @returns        A boolean representing whether or not the follower is following the followee
 */
export const isFollowing = (follower: Handle, followee?: Handle, opts?: Config): bool => {
  throw NotImplementedError();
};

/**
 * getFollowers() scans the current state of the network and returns an array of
 * all user handles following the given followee handle. This method is not yet
 * implemented.
 *
 * @param followee Optional. The followee handle to fetch followers for. Defaults to the current user.
 * @param opts     Optional. Configuration overrides, such as from address, if any
 * @returns        An array of all users following the followee
 */
export const getFollowers = (followee?: Handle, opts?: Config): Handle[] => {
  throw NotImplementedError();
};

/**
 * getFollowees() scans the current state of the network and returns an array of
 * all user handles being followed by the given follower handle. This method is
 * not yet implemented.
 *
 * @param follower Optional. The follower handle to fetch followees for. Defaults to the current user.
 * @param opts     Optional. Configuration overrides, such as from address, if any
 * @returns        An array of all users followed by the follower user
 */
export const getFollowees = (follower?: Handle, opts?: Config): Handle[] => {
  throw NotImplementedError();
};
