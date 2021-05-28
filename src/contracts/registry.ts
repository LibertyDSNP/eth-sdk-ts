import { getContractAddress } from "./contract";
import { HexString } from "../types/Strings";
import { getConfig } from "../config/config";
import { ContractTransaction } from "ethers";
import {MissingContract, MissingProvider, MissingSigner} from "../utilities";
import { Registry__factory } from "../types/typechain";
import {Logger} from "ethers/lib/utils";

const CONTRACT_NAME = "Registry";

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
    console.log({e})
    if (e?.code === Logger.errors.CALL_EXCEPTION) {
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
export const register = async (identityContractAddress: HexString, handle: HexString): Promise<ContractTransaction> => {
  const contract = await getContract();
  const { signer } = getConfig();
  if (!signer) throw MissingSigner;
  return await contract.connect(signer).register(identityContractAddress, handle);
};

const getContract = async () => {
  const { provider, contracts: { registry } } = getConfig();
  if (!provider) throw MissingProvider;
  const address = registry || await getContractAddress(provider, CONTRACT_NAME);

  if (!address) throw MissingContract;
  return Registry__factory.connect(address, provider);
};
