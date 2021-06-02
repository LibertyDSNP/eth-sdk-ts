import { Contract, ethers } from "ethers";
import { abi as cloneFactoryABI } from "@dsnp/contracts/abi/IIdentityCloneFactory.json";
import { abi as beaconFactoryABI } from "@dsnp/contracts/abi/IIdentityBeaconFactory.json";
import { abi as identityABI } from "@dsnp/contracts/abi/Identity.json";
import { ContractTransaction } from "ethers";
import { MissingProvider, MissingSigner, MissingContract } from "../utilities/errors";
import { getConfig, Config } from "../config/config";
import { EthereumAddress } from "../types/Strings";
import { IdentityCloneFactory } from "../types/typechain/IdentityCloneFactory";
import { BeaconFactory } from "../types/typechain/BeaconFactory";
import { Identity } from "../types/typechain";
import { GAS_LIMIT_BUFFER, getContract, getContractAddress } from "./contract";
const CONTRACT_NAME = "IdentityCloneFactory";
const LOGIC_CONTRACT_NAME = "Identity";
const BEACON_CONTRACT_NAME = "BeaconFactory";

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
  const contract = await getProxyFactoryContract(provider);
  const gasEstimate = await getGasLimitCloneProxy(contract, logic);
  return contract.connect(signer).createCloneProxy(logic, { gasLimit: gasEstimate });
};

/**
 * createCloneProxyWithOwner() Creates a new identity with the ecrecover address as the owner
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
  const contract = await getProxyFactoryContract(provider);
  const gasEstimate = await getGasLimitCloneProxy(contract, logic, owner);
  return contract.connect(signer).createCloneProxyWithOwner(logic, owner, { gasLimit: gasEstimate });
};

/**
 * createBeaconProxy(beacon?: EthereumAddress) Creates a new identity with the message sender as the owner
 * @param beacon The beacon address to use for identity creation
 * @param opts  Optional. Configuration overrides, such as from address, if any
 * @returns     A contract receipt promise
 */
export const createBeaconProxy = async (beacon?: EthereumAddress, opts?: Config): Promise<ContractTransaction> => {
  const { provider, signer } = await getConfig(opts);

  if (!signer) throw MissingSigner;
  if (!provider) throw MissingProvider;
  const contract = await getBeaconFactoryContract(provider);

  if (beacon) {
    const gasEstimate = await getGasLimitBeaconProxy(contract, beacon);
    return contract.connect(signer)["createBeaconProxy(address)"](beacon, { gasLimit: gasEstimate });
  } else {
    const gasEstimate = await getGasLimitBeaconProxy(contract);
    return contract.connect(signer)["createBeaconProxy()"]({ gasLimit: gasEstimate });
  }
};

/**
 * createBeaconProxyWithOwner(beacon?: Ethereum Address) Creates a new identity with the ecrecover address as the owner
 * @param beacon The beacon address to use for identity creation
 * @param owner The initial owner's address of the new contract
 * @param opts  Optional. Configuration overrides, such as from address, if any
 * @returns     A contract receipt promise
 */
export const createBeaconProxyWithOwner = async (
  owner: EthereumAddress,
  beacon: EthereumAddress,
  opts?: Config
): Promise<ContractTransaction> => {
  const { provider, signer } = await getConfig(opts);

  if (!signer) throw MissingSigner;
  if (!provider) throw MissingProvider;
  const contract = await getBeaconFactoryContract(provider);

  const gasEstimate = await getGasLimitBeaconProxyWithOwner(contract, beacon, owner);
  return contract.connect(signer).createBeaconProxyWithOwner(beacon, owner, { gasLimit: gasEstimate });
};

const getDefaultLogicContractAddress = async (provider: ethers.providers.Provider): Promise<EthereumAddress> => {
  const address = await getContractAddress(provider, LOGIC_CONTRACT_NAME);
  if (!address) throw MissingContract;
  return address;
};

const getProxyFactoryContract = async (provider: ethers.providers.Provider): Promise<IdentityCloneFactory> => {
  return (getContract(provider, CONTRACT_NAME, cloneFactoryABI) as unknown) as IdentityCloneFactory;
};

const getBeaconFactoryContract = async (provider: ethers.providers.Provider): Promise<BeaconFactory> => {
  return (getContract(provider, BEACON_CONTRACT_NAME, beaconFactoryABI) as unknown) as BeaconFactory;
};

const getGasLimitCloneProxy = async (
  contract: IdentityCloneFactory,
  logic: EthereumAddress,
  owner?: EthereumAddress
): Promise<number> => {
  const gasEstimate = owner
    ? await contract.estimateGas.createCloneProxyWithOwner(logic, owner)
    : await contract.estimateGas.createCloneProxy(logic);
  return gasEstimate.toNumber() + GAS_LIMIT_BUFFER;
};

const getGasLimitBeaconProxy = async (contract: BeaconFactory, beacon?: EthereumAddress): Promise<number> => {
  const gasEstimate = beacon
    ? await contract.estimateGas["createBeaconProxy(address)"](beacon)
    : await contract.estimateGas["createBeaconProxy()"]();
  return gasEstimate.toNumber() + GAS_LIMIT_BUFFER;
};

const getGasLimitBeaconProxyWithOwner = async (
  contract: BeaconFactory,
  beacon: EthereumAddress,
  owner: EthereumAddress
): Promise<number> => {
  const gasEstimate = await contract.estimateGas.createBeaconProxyWithOwner(beacon, owner);
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
  const identityContract = new Contract(contractAddress, identityABI, provider) as Identity;
  return identityContract.connect(signer).isAuthorizedTo(address, permission, blockNumber);
};
