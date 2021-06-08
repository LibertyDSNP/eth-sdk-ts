import { ethers } from "ethers";
import { getContractAddress, getVmError } from "./contract";
import { EthereumAddress, HexString } from "../../types/Strings";
import { getConfig } from "../../config";
import { BigNumber, ContractTransaction } from "ethers";
import { MissingContract, MissingProvider, MissingSigner } from "../utilities";
import { Registry__factory } from "../../types/typechain";
import { Permission } from "./identity";
import { resolveId} from "../../handles";
import { isAuthorizedTo } from "./identity";
import { DSNPMessage, serialize } from "../messages/messages";

const CONTRACT_NAME = "Registry";

export interface Registration {
  contractAddr: EthereumAddress;
  dsnpId: HexString;
  handle: Handle;
}

export type Handle = string;

/**
 * resolveRegistration() Try to resolve a handle into a DSNP Id
 *
 * @param handle String handle to resolve
 * @returns The Hex for the DSNP Id or null if not found
 */
export const resolveRegistration = async (handle: Handle): Promise<Registration | null> => {
  const contract = await getContract();
  try {
    const [dsnpId, contractAddr] = await contract.resolveRegistration(handle);
    return {
      handle,
      dsnpId: dsnpId.toHexString(),
      contractAddr,
    };
  } catch (e) {
    const vmError = getVmError(e);
    if (vmError?.includes("Handle does not exist")) {
      return null;
    }
    throw e;
  }
};

/**
 * register() registers a handle to get a new DSNP Id
 *
 * @param identityContractAddress Address of the identity contract to use
 * @param handle The string handle to register
 * @returns The contract Transaction
 */
export const register = async (identityContractAddress: HexString, handle: Handle): Promise<ContractTransaction> => {
  const contract = await getContract();
  const { signer } = getConfig();
  if (!signer) throw MissingSigner;
  return await contract.connect(signer).register(identityContractAddress, handle);
};

/**
 * changeAddress() changes the identity contract address of a DSNP Id
 *
 * @param handle The string handle to alter
 * @param identityContractAddress Address of the new identity contract to use
 * @returns The contract Transaction
 */
export const changeAddress = async (
  handle: Handle,
  identityContractAddress: HexString
): Promise<ContractTransaction> => {
  const contract = await getContract();
  const { signer } = getConfig();
  if (!signer) throw MissingSigner;
  return await contract.connect(signer).changeAddress(identityContractAddress, handle);
};

/**
 * changeHandle() changes the handle of a DSNP Id
 *
 * @param oldHandle The string handle to alter
 * @param newHandle The new handle to use instead
 * @returns The contract Transaction
 */
export const changeHandle = async (oldHandle: Handle, newHandle: Handle): Promise<ContractTransaction> => {
  const contract = await getContract();
  const { signer } = getConfig();
  if (!signer) throw MissingSigner;
  return await contract.connect(signer).changeHandle(oldHandle, newHandle);
};

/**
 * Get all the DSNPRegistryUpdate events
 * @param filter By dsnpId or Contract Address
 * @returns An array of all the matching events
 */
export const getDSNPRegistryUpdateEvents = async (
  filter: Partial<Omit<Registration, "handle">>
): Promise<Registration[]> => {
  const contract = await getContract();
  const dsnpId = filter.dsnpId ? BigNumber.from(filter.dsnpId) : undefined;
  const logs = await contract.queryFilter(contract.filters.DSNPRegistryUpdate(dsnpId, filter.contractAddr));

  return logs.map((desc) => {
    const [id, addr, handle] = desc.args;
    return { contractAddr: addr, dsnpId: id.toHexString(), handle };
  });
};

/**
 * validates a message against a signature and then checks that the signer has the permissions
 * specified.
 * @param signature the signature for the message
 * @param message the DSNPMessage
 * @param dsnpId the DSNP Id of the supposed signer
 * @param permission the permissions to check for
 * @param blockNumber (optional) the block number at which to perform this check.  Defaults to "latest"
 */
export const validateMessage = async (
  signature: HexString,
  message: DSNPMessage,
  dsnpId: HexString,
  permission: Permission,
  blockNumber?: number
): Promise<boolean> => {
  const reg = await resolveId(dsnpId);
  if (!reg) throw MissingContract;

  const { provider } = getConfig();
  if (!provider) throw MissingProvider;

  const realBlockNumber = blockNumber ? blockNumber : "latest";
  const bh = (await provider?.getBlock(realBlockNumber))?.number;
  if (!bh) throw new Error("could not get block at height " + realBlockNumber);

  const signerAddr = ethers.utils.verifyMessage(serialize(message), signature);
  return isAuthorizedTo(signerAddr, reg.contractAddr, permission, bh);
};

const getContract = async () => {
  const {
    provider,
    contracts: { registry },
  } = getConfig();
  if (!provider) throw MissingProvider;
  const address = registry || (await getContractAddress(provider, CONTRACT_NAME));

  if (!address) throw MissingContract;
  return Registry__factory.connect(address, provider);
};
