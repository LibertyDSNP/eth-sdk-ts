import { resolveRegistration, Handle } from "./core/contracts/registry";
import * as messages from "./core/messages/messages";
import * as batchMessages from "./core/batch/batchMesssages";
import * as config from "./config";
import { RegistrationNotFound } from "./handles";
import { MissingUser, NotImplementedError } from "./core/utilities";

/**
 * follow() creates a follow event and returns it.
 *
 * @param handle The handle of the user to follow
 * @param opts   Optional. Configuration overrides, such as from address, if any
 * @returns      The signed DSNP Graph Change message
 */
export const follow = async (
  handle: Handle,
  opts?: config.ConfigOpts
): Promise<batchMessages.BatchGraphChangeMessage> => {
  // Get current user id
  const { currentFromId } = config.getConfig(opts);
  if (!currentFromId) throw MissingUser;

  // Get followeeId from handle
  const registration = await resolveRegistration(handle);
  if (!registration) throw RegistrationNotFound;
  const followeeId = registration.dsnpId;

  // Creates and returns the DSNP Graph Change message
  const message = messages.createFollowGraphChangeMessage(currentFromId, followeeId);

  // Sign and return the message
  const signedMessage = await messages.sign(message, opts);
  return signedMessage as batchMessages.BatchGraphChangeMessage;
};

/**
 * unfollow() creates an unfollow event and returns it.
 *
 * @param handle  The handle of the user to unfollow
 * @param opts    Optional. Configuration overrides, such as from address, if any
 * @returns      The signed DSNP Graph Change message
 */
export const unfollow = async (
  handle: Handle,
  opts?: config.ConfigOpts
): Promise<batchMessages.BatchGraphChangeMessage> => {
  // Get current user id
  const { currentFromId } = config.getConfig(opts);
  if (!currentFromId) throw MissingUser;

  // Get followeeId from handle
  const registration = await resolveRegistration(handle);
  if (!registration) throw RegistrationNotFound;
  const followeeId = registration.dsnpId;

  // Creates and returns the DSNP Graph Change message
  const message = messages.createFollowGraphChangeMessage(currentFromId, followeeId);

  // Sign and return the message
  const signedMessage = await messages.sign(message, opts);
  return signedMessage as batchMessages.BatchGraphChangeMessage;
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
export const isFollowing = async (
  _follower: Handle,
  _followee?: Handle,
  _opts?: config.ConfigOpts
): Promise<boolean> => {
  throw NotImplementedError;
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
export const getFollowers = async (_followee?: Handle, _opts?: config.ConfigOpts): Promise<Handle[]> => {
  throw NotImplementedError;
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
export const getFollowees = (_follower?: Handle, _opts?: config.ConfigOpts): Promise<Handle[]> => {
  throw NotImplementedError;
};
