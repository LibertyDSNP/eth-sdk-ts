import { ContractTransaction } from "ethers";

import { Config } from "../config/config";

/**
 * createCloneProxy() Creates a new identity with the message sender as the owner
 *
 * @param logic The address to use for the logic contract
 * @param opts  Optional. Configuration overrides, such as from address, if any
 * @returns     A contract receipt promise
 */
export const createCloneProxy = async (logic: EthereumAddress, opts?: Config): Promise<ContractTransaction> => {};

/**
 * createCloneProxy() Creates a new identity with the ecrecover address as the owner
 *
 * @param logic The address to use for the logic contract
 * @param owner The initial owner's address of the new contract
 * @param opts  Optional. Configuration overrides, such as from address, if any
 * @returns     A contract receipt promise
 */
export const createCloneProxyWithOwner = async (
  logic: EthereumAddress,
  owner: EthereumAddress,
  opts?: Config
): Promise<ContractTransaction> => {};
