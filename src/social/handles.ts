import { ConfigOpts } from "../config/config";
import { HexString } from "../types/Strings";
import { NotImplementedError } from "../utilities/errors";
import { registry } from "../contracts";
import {Registration, Handle, getRegistrations} from "../contracts/registry";
import {ContractTransaction} from "ethers";

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
export const authenticateHandle = async (_id: Handle, _opts?: ConfigOpts): Promise<void> => {
  throw NotImplementedError;
};

/**
 * getRegistration() fetches information regarding the current published state of a
 * given registration by handle. This method is not yet implemented.
 *
 * @param id   The Handle of the registration for which to fetch profile data
 * @returns    The Registration object associated with the given Handle
 */
export const getRegistration = async (_id: Handle): Promise<Registration> => {
  throw NotImplementedError;
};

/**
 * updateUser() updates profile data for the user given by handle. This method
 * will only work if the given handle has already been authenticated. This
 * method is not yet implemented.
 *
 * @param id   The Handle of the user for which to fetch profile data
 * @param user Any updates to be merged into the current profile data
 * @param opts Optional. Configuration overrides, such as from address, if any
 * @returns    The pending transaction
 */
export const updateUser = async (_id: Handle, _registration: Registration, _opts?: ConfigOpts): Promise<ContractTransaction> => {
  throw NotImplementedError;
};

export const resolveHandle = async (handle: Handle): Promise<Registration> => {
  const registrations = await registry.getRegistrations({
    handle,
  })
  if (registrations.length === 0) {
    throw new Error("Handle not found");
  }
  return registrations[registrations.length - 1];
};

export const resolveId = async (_dsnpId: HexString): Promise<Registration> => {
  throw NotImplementedError;
};

/**
 * availabilityFilter() takes a list of handles returning a filtered list of just the ones that are available
 * @param handles A list of handles to check for availability
 * @returns       The filtered list of handles that are currently available
 */
export const availabilityFilter = async (handles: Handle[]): Promise<Handle[]> => {
  const availability = await Promise.all(handles.map(isAvailable));
  return handles.filter((_handle, index) => availability[index]);
};

/**
 * isAvailable() checks to see if the given handle is available
 * @param handle    The handle to test for availability
 * @returns boolean If the handle is available
 */
export const isAvailable = async (handle: Handle): Promise<boolean> => {
  return (await registry.resolveHandleToId(handle)) === null;
};
