import { ethers, ContractTransaction } from "ethers";

import { getContractAddress } from "./contract";
import { MissingRegistrationError } from "./errors";
import { EthereumAddress, HexString } from "../../types/Strings";
import { ConfigOpts, requireGetSigner, requireGetProvider } from "../config";
import { Registry__factory } from "../../types/typechain";
import { getDelegateIdentitiesFor, Permission } from "./identity";
import { isAuthorizedTo } from "./identity";
import { Announcement, serialize } from "../announcements";
import { convertBigNumberToDSNPUserURI, convertDSNPUserIdOrURIToBigNumber, DSNPUserURI } from "../identifiers";

const CONTRACT_NAME = "Registry";

export interface Registration {
  contractAddr: EthereumAddress;
  dsnpUserURI: DSNPUserURI;
  handle: Handle;
}

export type Handle = string;

/**
 * Checks to see if the address is zero
 *
 * @param addr - The address to check
 * @returns true if the address is nothing but zeros
 */
const isZeroAddress = (addr: string): boolean => {
  return addr.replace(/[0x]/g, "") === "";
};

/**
 * resolveRegistration() Try to resolve a handle into a Registration
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * @param handle - String handle to resolve
 * @param opts - (optional) any config overrides.
 * @returns A Registration object for the user or null if not found
 */
export const resolveRegistration = async (handle: Handle, opts?: ConfigOpts): Promise<Registration | null> => {
  const contract = await getContract(opts);
  const [userId, contractAddr] = await contract.resolveRegistration(handle);
  if (userId.isZero() && isZeroAddress(contractAddr)) {
    return null;
  }
  return {
    handle,
    dsnpUserURI: convertBigNumberToDSNPUserURI(userId),
    contractAddr,
  };
};

/**
 * register() registers a handle to get a new identity contract address
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the registration contract address cannot be found.
 * @param identityContractAddress - Address of the identity contract to use
 * @param handle - The string handle to register
 * @param opts - (optional) any config overrides.
 * @returns The contract Transaction
 */
export const register = async (
  identityContractAddress: HexString,
  handle: Handle,
  opts?: ConfigOpts
): Promise<ContractTransaction> => {
  const contract = await getContract(opts);
  const signer = requireGetSigner(opts);

  return await contract.connect(signer).register(identityContractAddress, handle);
};

/**
 * changeAddress() changes the identity contract address of a user
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the registration contract address cannot be found.
 * @param handle - The string handle to alter
 * @param identityContractAddress - Address of the new identity contract to use
 * @param opts - (optional) any config overrides.
 * @returns The contract Transaction
 */
export const changeAddress = async (
  handle: Handle,
  identityContractAddress: HexString,
  opts?: ConfigOpts
): Promise<ContractTransaction> => {
  const contract = await getContract(opts);
  const signer = requireGetSigner(opts);
  return await contract.connect(signer).changeAddress(identityContractAddress, handle);
};

/**
 * changeHandle() changes the handle of a user
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the registration contract address cannot be found.
 * @param oldHandle - The string handle to alter
 * @param newHandle - The new handle to use instead
 * @param opts - (optional) any config overrides.
 * @returns The contract Transaction
 */
export const changeHandle = async (
  oldHandle: Handle,
  newHandle: Handle,
  opts?: ConfigOpts
): Promise<ContractTransaction> => {
  const contract = await getContract(opts);
  const signer = requireGetSigner(opts);
  return await contract.connect(signer).changeHandle(oldHandle, newHandle);
};

/**
 * getDSNPRegistryUpdateEvents() Get all the DSNPRegistryUpdate events
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the registration contract address cannot be found.
 * @param filter - By dsnpUserURI or Contract Address
 * @param opts - (optional) any config overrides.
 * @returns An array of all the matching events
 */
export const getDSNPRegistryUpdateEvents = async (
  filter: Partial<Omit<Registration, "handle">>,
  opts?: ConfigOpts
): Promise<Registration[]> => {
  const userId = filter.dsnpUserURI ? convertDSNPUserIdOrURIToBigNumber(filter.dsnpUserURI) : undefined;
  const contract = await getContract(opts);
  const logs = await contract.queryFilter(contract.filters.DSNPRegistryUpdate(userId, filter.contractAddr));

  return logs.map((desc) => {
    const [id, addr, handle] = desc.args;
    const dsnpUserURI = convertBigNumberToDSNPUserURI(id);
    return { contractAddr: addr, dsnpUserURI, handle };
  });
};

/**
 * isSignatureAuthorizedTo() validates a serialized message or announcement against a signature and then checks that the
 * signer has the permissions specified. Announcements should be passed as is,
 * without serializing, to guarantee consistent results.
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingRegistrationError}
 * Thrown if a registration cannot be found for the given DSNP User URI.
 * @throws {@link MissingContractAddressError}
 * Thrown if the requested contract address cannot be found.
 * @param signature - the signature for the message
 * @param message - the signed announcement or string
 * @param dsnpUserURI - the DSNP User URI of the supposed signer
 * @param permission - the permissions to check for
 * @param blockTag - (optional). A block number or string BlockTag
 *    (see https://docs.ethers.io/v5/api/providers/types/)
 *    Defaults to 0x0, which checks for "forever" permissions.
 * @param opts - (optional) any config overrides.
 */
export const isSignatureAuthorizedTo = async (
  signature: HexString,
  message: Announcement | string,
  dsnpUserURI: DSNPUserURI,
  permission: Permission,
  blockTag?: ethers.providers.BlockTag,
  opts?: ConfigOpts
): Promise<boolean> => {
  const registrations = await getDSNPRegistryUpdateEvents(
    {
      dsnpUserURI,
    },
    opts
  );
  if (registrations.length === 0) throw new MissingRegistrationError(dsnpUserURI);
  const reg = registrations[registrations.length - 1];

  const provider = requireGetProvider(opts);
  let blockNumber = 0x0;
  if (blockTag) {
    const bn = (await provider?.getBlock(blockNumber))?.number;
    if (bn) blockNumber = bn;
  }
  const signedString = typeof message === "string" ? (message as string) : serialize(message);

  const signerAddr = ethers.utils.verifyMessage(signedString, signature);
  return isAuthorizedTo(signerAddr, reg.contractAddr, permission, blockNumber);
};

const getContract = async (opts?: ConfigOpts) => {
  const provider = requireGetProvider(opts);
  const address = await getContractAddress(provider, CONTRACT_NAME, opts);

  return Registry__factory.connect(address, provider);
};

/**
 * getRegistrationsByIdentityAddress() Resolves all registrations associated to an identity contract address
 *
 * @param identityAddress - The identity contract address to resolve the registrations for
 * @returns A list of registrations that are associated to the identity contract address
 */
export const getRegistrationsByIdentityAddress = async (identityAddress: HexString): Promise<Registration[]> => {
  const lastRegistryUpdates = await getLatestRegistryUpdatesFor(identityAddress);

  const registrationsHandles: Handle[] = lastRegistryUpdates.map((registrations: Registration) => registrations.handle);

  if (registrationsHandles.length === 0) return [];

  const allRegistrations = await Promise.all(registrationsHandles.map((handle: Handle) => resolveRegistration(handle)));

  const isRegistration = (r: Registration | null): r is Registration => !!r && r.contractAddr === identityAddress;

  return allRegistrations.filter(isRegistration);
};

const getLatestRegistryUpdatesFor = async (identityAddress: HexString): Promise<Registration[]> => {
  const registrations: Registration[] = await getDSNPRegistryUpdateEvents({ contractAddr: identityAddress });

  const lastRegistration = registrations.reduce<Record<string, Registration>>((acc, r) => {
    acc[r.dsnpUserURI] = r;

    return acc;
  }, {});

  return Object.values(lastRegistration);
};

/**
 * getRegistrationsByWalletAddress() Resolves all registrations associated to an identity contract address
 *
 * @param walletAddress - The address to resolve the registrations for
 * @returns A list of registrations that are associated to the address
 */
export const getRegistrationsByWalletAddress = async (walletAddress: EthereumAddress): Promise<Registration[]> => {
  const identityAddresses: EthereumAddress[] = await getDelegateIdentitiesFor(walletAddress);

  const registrations: Registration[][] = await Promise.all(
    identityAddresses.map((identityAddresses) => getRegistrationsByIdentityAddress(identityAddresses))
  );

  return ([] as Registration[]).concat(...registrations);
};
