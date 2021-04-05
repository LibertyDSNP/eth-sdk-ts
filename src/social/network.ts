import { SocialIdentityAddress } from "../types/Strings";

interface FollowOpts {}

/**
 * follow() creates a follow activity pub event and enqueues it for the next
 * batch. This method is not yet implemented.
 */
export const follow = (id: SocialIdentityAddress) => {
  throw NotImplementedError();
};

interface UnfollowOpts {}

/**
 * unfollow() creates an unfollow activity pub event and enqueues it for the
 * next batch. This method is not yet implemented.
 */
export const unfollow = (id: SocialIdentityAddress) => {
  throw NotImplementedError();
};

/**
 * isFollowing() scans the current state of the network and returns a boolean
 * representing whether or not a given user is following another given user.
 * This method is not yet implemented.
 */
export const isFollowing = (followerId: SocialIdentityAddress, followeeId: SocialIdentityAddress): bool => {
  throw NotImplementedError();
};

interface User {}

/**
 * getUser() fetches information regarding the current published state of a
 * given user. This method is not yet implemented.
 */
export const getUser = (id: SocialIdentityAddress): User => {
  throw NotImplementedError();
};
