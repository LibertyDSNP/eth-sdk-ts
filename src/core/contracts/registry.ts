import { ethers, ContractTransaction } from "ethers";

import { getContractAddress, getVmError, VmError } from "./contract";
import { MissingRegistrationContractError } from "./contractErrors";
import { EthereumAddress, HexString } from "../../types/Strings";
import { ConfigOpts, requireGetSigner, requireGetProvider } from "../../config";
import { Registry__factory } from "../../types/typechain";
import { Permission } from "./identity";
import { isAuthorizedTo } from "./identity";
import { DSNPMessage, serialize } from "../messages";
import { convertBigNumberToDSNPUserId, convertDSNPUserIdToBigNumber, DSNPUserId } from "../utilities/identifiers";

const CONTRACT_NAME = "Registry";

export interface Registration {
  contractAddr: EthereumAddress;
  dsnpUserId: DSNPUserId;
  handle: Handle;
}

export type Handle = string;

/**
 * resolveRegistration() Try to resolve a handle into a DSNP User Id
 *
 * @param handle - String handle to resolve
 * @param opts - (optional) any config overrides.
 * @returns The Hex for the DSNP User Id or null if not found
 */
export const resolveRegistration = async (handle: Handle, opts?: ConfigOpts): Promise<Registration | null> => {
  const contract = await getContract(opts);
  try {
    const [dsnpUserId, contractAddr] = await contract.resolveRegistration(handle);
    return {
      handle,
      dsnpUserId: convertBigNumberToDSNPUserId(dsnpUserId),
      contractAddr,
    };
  } catch (e) {
    const error = <VmError>e;
    const vmError = getVmError(error);
    if (vmError?.includes("Handle does not exist")) {
      return null;
    }
    throw e;
  }
};

/**
 * register() registers a handle to get a new DSNP User Id
 *
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
 * changeAddress() changes the identity contract address of a DSNP User Id
 *
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
 * changeHandle() changes the handle of a DSNP User Id
 *
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
 * @param filter - By dsnpUserId or Contract Address
 * @param opts - (optional) any config overrides.
 * @returns An array of all the matching events
 */
export const getDSNPRegistryUpdateEvents = async (
  filter: Partial<Omit<Registration, "handle">>,
  opts?: ConfigOpts
): Promise<Registration[]> => {
  const dsnpUserId = filter.dsnpUserId ? convertDSNPUserIdToBigNumber(filter.dsnpUserId) : undefined;
  const contract = await getContract(opts);
  const logs = await contract.queryFilter(contract.filters.DSNPRegistryUpdate(dsnpUserId, filter.contractAddr));

  return logs.map((desc) => {
    const [id, addr, handle] = desc.args;
    const dsnpUserId = convertBigNumberToDSNPUserId(id);
    return { contractAddr: addr, dsnpUserId, handle };
  });
};

/**
 * isMessageSignatureAuthorizedTo() validates a serialized message or DSNPMessage against a signature and then checks that the
 * signer has the permissions specified.  DSNPMessages should be passed as is,
 * without serializing, to guarantee consistent results.
 *
 * @param signature - the signature for the message
 * @param message - the signed message
 * @param dsnpUserId - the DSNP User Id of the supposed signer
 * @param permission - the permissions to check for
 * @param blockTag - (optional). A block number or string BlockTag
 *    (see https://docs.ethers.io/v5/api/providers/types/)
 *    Defaults to 0x0, which checks for "forever" permissions.
 * @param opts - (optional) any config overrides.
 */
export const isMessageSignatureAuthorizedTo = async (
  signature: HexString,
  message: DSNPMessage | string,
  dsnpUserId: DSNPUserId,
  permission: Permission,
  blockTag?: ethers.providers.BlockTag,
  opts?: ConfigOpts
): Promise<boolean> => {
  const registrations = await getDSNPRegistryUpdateEvents(
    {
      dsnpUserId,
    },
    opts
  );
  if (registrations.length === 0) throw new MissingRegistrationContractError(dsnpUserId);
  const reg = registrations[registrations.length - 1];

  const provider = requireGetProvider(opts);
  let blockNumber = 0x0;
  if (blockTag) {
    const bn = (await provider?.getBlock(blockNumber))?.number;
    if (bn) blockNumber = bn;
  }
  const messageString = typeof message === "string" ? (message as string) : serialize(message);

  const signerAddr = ethers.utils.verifyMessage(messageString, signature);
  return isAuthorizedTo(signerAddr, reg.contractAddr, permission, blockNumber);
};

const getContract = async (opts?: ConfigOpts) => {
  const provider = requireGetProvider(opts);
  const address = await getContractAddress(provider, CONTRACT_NAME, opts);

  return Registry__factory.connect(address, provider);
};
