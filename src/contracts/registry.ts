import { getContractAddress } from "./contract";
import { HexString } from "../types/Strings";
import { getConfig } from "../config/config";
import { ContractTransaction } from "ethers";
import { MissingContract, MissingProvider, MissingSigner } from "../utilities";
import { Registry__factory } from "../types/typechain";

const CONTRACT_NAME = "Registry";

/**
 * Get the JSON RPC error from the body, if one exists
 * @param e The error expected to have a vm Error
 *
 * @returns the error if any
 */
const getVmError = (e: { body?: string }): string | undefined => {
  try {
    const parsed = JSON.parse(e.body || "{}");
    return parsed?.error?.message;
  } catch (e) {
    return undefined;
  }
};

/**
 * resolveHandleToId() Try to resolve a handle into a DSNP Id
 *
 * @param handle String handle to resolve
 * @returns The Hex for the DSNP Id or null if not found
 */
export const resolveHandleToId = async (handle: string): Promise<HexString | null> => {
  const contract = await getContract();
  try {
    return (await contract.resolveHandleToId(handle)).toHexString();
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
export const register = async (identityContractAddress: HexString, handle: string): Promise<ContractTransaction> => {
  const contract = await getContract();
  const { signer } = getConfig();
  if (!signer) throw MissingSigner;
  return await contract.connect(signer).register(identityContractAddress, handle);
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
