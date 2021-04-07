import { Config } from "../config/config";
import { KeccakHash } from "../utilities/hash";

interface User {}

type Handle = string;

/**
 * authenticateHandle() claims a registry handle to the current user. If the
 * given handle has not yet been claimed, the handle will be claimed by the
 * current configured DSNP address. If the handle has been previously claimed by
 * the current address, the handle will be set to the active handle and used for
 * all events created on chain. If the handle has been previously claimed by an
 * address other than the current DSNP address, an error will be thrown. This
 * method is very much not yet implemented.
 *
 * @param id  The Handle of the user for which to fetch profile data
 * @param opts Optional. Configuration overrides, such as from address, if any
 */
export const authenticateHandle = async (id: Handle, opts?: Config) => {
  throw NotImplementedError();
};

/**
 * getUser() fetches information regarding the current published state of a
 * given user by handle. This method is not yet implemented.
 *
 * @param id   The Handle of the user for which to fetch profile data
 * @param opts Optional. Configuration overrides, such as from address, if any
 * @returns    The User object associated with the given Handle
 */
export const getUser = async (id: Handle, opts?: Config): User => {
  throw NotImplementedError();
};

/**
 * updateUser() updates profile data for the user given by handle. This method
 * will only work if the given handle has already been authenticated. This
 * method is not yet implemented.
 *
 * @param id   The Handle of the user for which to fetch profile data
 * @param user Any updates to be merged into the current profile data
 * @param opts Optional. Configuration overrides, such as from address, if any
 * @returns    The User object associated with the given Handle
 */
export const updateUser = async (id: Handle, user: User, opts?: Config): User => {
  throw NotImplementedError();
};

/**
 * handleToAddress() takes a DSNP handle and returns the associated DSNP
 * identity address. This method is not yet implemented.
 *
 * @param handle The DSNP handle for which to fetch the address
 * @param opts   Optional. Configuration overrides, such as from address, if any
 * @returns      The DSNP address associated with the given handle
 */
export const handleToAddress = async (handle: Handle, opts?: Config) => {
  throw NotImplementedError();
};

/**
 * addressToHandles() takes a DSNP identity address and returns an array of all
 * associated DSNP handles. This method is not yet implemented.
 *
 * @param address The DSNP identity address for which to fetch handles
 * @param opts    Optional. Configuration overrides, such as from address, if any
 * @returns       An array of DSNP handles associated with the address
 */
export const addressToHandles = async (address: KeccakHash, opts?: Config): Handle[] => {
  throw NotImplementedError();
};
