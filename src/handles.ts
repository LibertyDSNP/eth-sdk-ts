import * as config from "./core/config";
import { Registration, Handle, getDSNPRegistryUpdateEvents, resolveRegistration } from "./core/contracts/registry";
import { createAndRegisterBeaconProxy } from "./core/contracts/identity";
import { findEvent } from "./core/contracts/contract";
import { convertToDSNPUserURI, DSNPUserURI } from "./core/identifiers";
import { HexString } from "./types/Strings";

/**
 * createRegistration() creates a new identity for a public key and registers a handle to it.
 * This function will wait for the identity to land on chain before resolving.
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link NoLogsFoundContractError}
 * Thrown if the DSNPRegistryUpdate event could not be found.
 * @throws {@link MissingContractAddressError}
 * Thrown if the registration contract address cannot be found.
 * @param addr - public key address that will be used to control identity delegate
 * @param handle - name of identity (must be globally unique)
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns DSNP User URI of identity created
 */
export const createRegistration = async (
  addr: HexString,
  handle: Handle,
  opts?: config.ConfigOpts
): Promise<Registration> => {
  const txn = await createAndRegisterBeaconProxy(addr, handle, opts);
  const receipt = await txn.wait(1);

  const registerEvent = findEvent("DSNPRegistryUpdate", receipt.logs);
  const registration = {
    dsnpUserURI: convertToDSNPUserURI(registerEvent.args[0]),
    contractAddr: registerEvent.args[1],
    handle: registerEvent.args[2],
  };

  return registration;
};

/**
 * Get the current registration from a handle
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the registration contract address cannot be found.
 * @param handle - The Registry Handle
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns The Registration object with Handle, DSNP User URI, and Identity contract address
 */
export const resolveHandle = (handle: Handle, opts?: config.ConfigOpts): Promise<Registration | null> =>
  resolveRegistration(handle, opts);

/**
 * Get the current registration from a DSNP User URI
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the registration contract address cannot be found.
 * @param dsnpUserURI - The DSNP User URI
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns The Registration object with Handle, DSNP User URI, and Identity contract address
 */
export const resolveId = async (dsnpUserURI: DSNPUserURI, opts?: config.ConfigOpts): Promise<Registration | null> => {
  const registrations = await getDSNPRegistryUpdateEvents(
    {
      dsnpUserURI,
    },
    opts
  );

  if (registrations.length === 0) return null;
  return registrations[registrations.length - 1];
};

/**
 * availabilityFilter() takes a list of handles returning a filtered list of just the ones that are available
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the registration contract address cannot be found.
 * @param handles - A list of handles to check for availability
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns The filtered list of handles that are currently available
 */
export const availabilityFilter = async (handles: Handle[], opts?: config.ConfigOpts): Promise<Handle[]> => {
  const availability = await Promise.all(handles.map((handle) => isAvailable(handle, opts)));
  return handles.filter((_handle, index) => availability[index]);
};

/**
 * isAvailable() checks to see if the given handle is available
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the registration contract address cannot be found.
 * @param handle - The handle to test for availability
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns boolean If the handle is available
 */
export const isAvailable = async (handle: Handle, opts?: config.ConfigOpts): Promise<boolean> => {
  return (await resolveRegistration(handle, opts)) === null;
};
