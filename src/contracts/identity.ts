import { Contract, ethers } from "ethers";
import { abi as cloneFactoryABI } from "@dsnp/contracts/abi/IIdentityCloneFactory.json";
import { ContractTransaction } from "ethers";
import { MissingProvider, MissingSigner, MissingContract } from "../utilities/errors";
import { getConfig, Config } from "../config/config";
import { EthereumAddress } from "../types/Strings";
import { IdentityCloneFactory } from "../types/typechain/IdentityCloneFactory";
import { GAS_LIMIT_BUFFER, getContractAddress } from "./contract";

const CONTRACT_NAME = "IdentityCloneFactory";
const LOGIC_CONTRACT_NAME = "Identity";
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

  if (!logic) logic = await getDefaultLogicContract(provider);
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

  if (!logic) logic = await getDefaultLogicContract(provider);
  const contract = await getFactoryContract(provider);
  const gasEstimate = await getGasLimitWithOwner(contract, logic, owner);
  return contract.connect(signer).createCloneProxyWithOwner(logic, owner, { gasLimit: gasEstimate });
};

const getDefaultLogicContract = async (provider: ethers.providers.Provider): Promise<EthereumAddress> => {
  const address = await getContractAddress(provider, LOGIC_CONTRACT_NAME);
  if (!address) throw MissingContract;
  return address;
};

const getFactoryContract = async (provider: ethers.providers.Provider): Promise<IdentityCloneFactory> => {
  const address = await getContractAddress(provider, CONTRACT_NAME);
  if (!address) throw MissingContract;
  return new Contract(address, cloneFactoryABI, provider) as IdentityCloneFactory;
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