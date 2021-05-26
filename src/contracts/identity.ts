import { Contract, ethers } from "ethers";
import { abi as cloneFactoryABI } from "@dsnp/contracts/abi/IIdentityCloneFactory.json";
import { abi as identityABI } from "@dsnp/contracts/abi/Identity.json";
import { ContractTransaction } from "ethers";
import { MissingProvider, MissingSigner, MissingContract } from "../utilities/errors";
import { getConfig, Config } from "../config/config";
import { EthereumAddress } from "../types/Strings";
import { IdentityCloneFactory } from "../types/typechain/IdentityCloneFactory";
import { Identity } from "../types/typechain";
import { GAS_LIMIT_BUFFER, getContract, getContractAddress } from "./contract";
const CONTRACT_NAME = "IdentityCloneFactory";
const LOGIC_CONTRACT_NAME = "Identity";

export enum Permission {
  NONE,
  ANNOUNCE,
  OWNERSHIP_TRANSFER,
  DELEGATE_ADD,
  DELEGATE_REMOVE,
}
/**
 * createCloneProxy() Creates a new identity with the message sender as the owner
 *
 * @param logic The address to use for the logic contract
 * @param opts  Optional. Configuration overrides, such as from address, if any
 * @returns     A contract receipt promise
 */
export const createCloneProxy = async (logic?: EthereumAddress, opts?: Config): Promise<ContractTransaction> => {
  const { provider, signer } = await getConfig(opts);

  if (!signer) throw MissingSigner;
  if (!provider) throw MissingProvider;

  if (!logic) logic = await getDefaultLogicContractAddress(provider);
  const contract = await getFactoryContract(provider);
  const gasEstimate = await getGasLimit(contract, logic);
  return contract.connect(signer).createCloneProxy(logic, { gasLimit: gasEstimate });
};

/**
 * createCloneProxy() Creates a new identity with the ecrecover address as the owner
 *
 * @param logic The address to use for the logic contract
 * @param owner The initial owner's address of the new contract
 * @param opts  Optional. Configuration overrides, such as from address, if any
 * @returns     A contract receipt promise
 */
export const createCloneProxyWithOwner = async (
  owner: EthereumAddress,
  logic?: EthereumAddress,
  opts?: Config
): Promise<ContractTransaction> => {
  const { provider, signer } = await getConfig(opts);

  if (!signer) throw MissingSigner;
  if (!provider) throw MissingProvider;

  if (!logic) logic = await getDefaultLogicContractAddress(provider);
  const contract = await getFactoryContract(provider);
  const gasEstimate = await getGasLimitWithOwner(contract, logic, owner);
  return contract.connect(signer).createCloneProxyWithOwner(logic, owner, { gasLimit: gasEstimate });
};

const getDefaultLogicContractAddress = async (provider: ethers.providers.Provider): Promise<EthereumAddress> => {
  const address = await getContractAddress(provider, LOGIC_CONTRACT_NAME);
  if (!address) throw MissingContract;
  return address;
};

const getFactoryContract = async (provider: ethers.providers.Provider): Promise<IdentityCloneFactory> => {
  return (getContract(provider, CONTRACT_NAME, cloneFactoryABI) as unknown) as IdentityCloneFactory;
};

const getIdentityContract = async (
  provider: ethers.providers.Provider,
  contractAddress: EthereumAddress
): Promise<Identity> => {
  return new Contract(contractAddress, identityABI, provider) as Identity;
};

const getGasLimit = async (contract: IdentityCloneFactory, logic: EthereumAddress): Promise<number> => {
  const gasEstimate = await contract.estimateGas.createCloneProxy(logic);

  return gasEstimate.toNumber() + GAS_LIMIT_BUFFER;
};

const getGasLimitWithOwner = async (
  contract: IdentityCloneFactory,
  logic: EthereumAddress,
  owner: EthereumAddress
): Promise<number> => {
  const gasEstimate = await contract.estimateGas.createCloneProxyWithOwner(logic, owner);

  return gasEstimate.toNumber() + GAS_LIMIT_BUFFER;
};

export const isAuthorizedTo = async (
  address: EthereumAddress,
  contractAddress: EthereumAddress,
  permission: Permission,
  blockNumber: number,
  opts?: Config
): Promise<boolean> => {
  const { provider, signer } = await getConfig(opts);

  if (!signer) throw MissingSigner;
  if (!provider) throw MissingProvider;
  const contract = await getIdentityContract(provider, contractAddress);
  return contract.connect(signer).isAuthorizedTo(address, permission, blockNumber);
};
