import { SocialIdentityAddress } from "../types/Strings";

interface FollowOpts {}

/**
 * follow() creates a follow activity pub event and enqueues it for the next
 * batch. This method is not yet implemented.
 */
export const follow = (id: DSNPHandle) => {
  throw NotImplementedError();
};

interface UnfollowOpts {}

/**
 * unfollow() creates an unfollow activity pub event and enqueues it for the
 * next batch. This method is not yet implemented.
 */
export const unfollow = (id: DSNPHandle) => {
  throw NotImplementedError();
};

/**
 * isFollowing() scans the current state of the network and returns a boolean
 * representing whether or not a given user is following another given user.
 * This method is not yet implemented.
 */
export const isFollowing = (followerId: DSNPHandle, followeeId: DSNPHandle): bool => {
  throw NotImplementedError();
};

interface User {}

/**
 * getUser() fetches information regarding the current published state of a
 * given user. This method is not yet implemented.
 */
export const getUser = (id: DSNPHandle): User => {
  throw NotImplementedError();
};

/**
 * handleToAddress() takes a DSNP handle and returns the associated DSNP
 * identity address. This method is not yet implemented.
 *
 * @param handle  The DSNP handle for which to fetch the address
 * @returns       The DSNP address associated with the given handle
 */
export const handleToAddress = () => {};

/**
 * addressToHandles() takes a DSNP identity address and returns an array of all
 * associated DSNP handles. This method is not yet implemented.
 *
 * @param address  The DSNP identity address for which to fetch handles
 * @returns        An array of DSNP handles associated with the address
 */
export const addressToHandles = (): DSNPHandle[] => {};
