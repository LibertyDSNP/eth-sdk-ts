import { ConfigOpts } from "./config";
import { HexString } from "./types/Strings";
import { NotImplementedError } from "./core/utilities";
import { Registration, Handle, getDSNPRegistryUpdateEvents, resolveRegistration } from "./core/contracts/registry";
import { ContractTransaction } from "ethers";
import { createAndRegisterBeaconProxy } from "./core/contracts/identity";
import { findEvent } from "./core/contracts/contract";
import { BigNumber } from "ethers";

/**
 * createRegistration() creates a new identity for a public key and registers a handle to it.
 * This function will wait for the identity to land on chain before resolving.
 * @param addr public key address that will be used to control identity delegate
 * @param handle name of identity (must be globaly unique)
 * @return id of identity created
 */
export const createRegistration = async (addr: HexString, handle: Handle): Promise<number> => {
  const txn = await createAndRegisterBeaconProxy(addr, handle);
  const receipt = await txn.wait(1);

  const registerEvent = findEvent("DSNPRegistryUpdate", receipt.logs);
  return (registerEvent.args[0] as BigNumber).toNumber();
};

/**
 * updateRegistration() updates registry data for a handle. This method
 * will only work if the given handle has already been authenticated. This
 * method is not yet implemented.
 *
 * @param id   The Handle of the user for which to fetch profile data
 * @param registration Any updates to be merged into the current profile data
 * @param opts Optional. Configuration overrides, such as from address, if any
 * @returns    The pending transaction
 */
export const updateRegistration = async (
  _id: Handle,
  _registration: Registration,
  _opts?: ConfigOpts
): Promise<ContractTransaction> => {
  throw NotImplementedError;
};

/**
 * Get the current registration from a handle
 * @param handle The Registry Handle
 * @returns The Registration object with Handle, DSNP Id, and Identity contract address
 */
export const resolveHandle = (handle: Handle): Promise<Registration | null> => resolveRegistration(handle);

/**
 * Get the current registration from a DSNP Id
 * @param id The Hex or decimal DSNP Id
 * @returns The Registration object with Handle, DSNP Id, and Identity contract address
 */
export const resolveId = async (id: HexString | number): Promise<Registration | null> => {
  const dsnpId = typeof id === "string" ? id : "0x" + id.toString(16);
  const registrations = await getDSNPRegistryUpdateEvents({
    dsnpId,
  });
  if (registrations.length === 0) return null;
  return registrations[registrations.length - 1];
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
  return (await resolveRegistration(handle)) === null;
};
