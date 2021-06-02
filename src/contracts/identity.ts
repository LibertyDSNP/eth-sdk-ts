import { ContractTransaction } from "ethers";
import { MissingProvider, MissingSigner, MissingContract } from "../utilities/errors";
import { getConfig, Config } from "../config/config";
import { EthereumAddress } from "../types/Strings";
import { IdentityCloneFactory } from "../types/typechain/IdentityCloneFactory";
import { BeaconFactory } from "../types/typechain/BeaconFactory";
import { BeaconFactory__factory, Identity__factory, IdentityCloneFactory__factory } from "../types/typechain";
import { getContractAddress } from "./contract";
const IDENTITY_CLONE_FACTORY_CONTRACT = "IdentityCloneFactory";
const IDENTITY_CONTRACT = "Identity";
const BEACON_CONTRACT = "BeaconFactory";

export enum Permission {
  NONE,
  ANNOUNCE,
  OWNERSHIP_TRANSFER,
  DELEGATE_ADD,
  DELEGATE_REMOVE,
}
/**
 * createCloneProxy(logic?: Ethereum Address ) Creates a new identity with the message sender as the owner
 * @param logic The address to use for the logic contract
 * @returns     A contract receipt promise
 */
export const createCloneProxy = async (logic?: EthereumAddress): Promise<ContractTransaction> => {
  if (!logic) logic = await getIdentityContractAddress();
  const contract = await getProxyFactoryContract();
  return contract.createCloneProxy(logic);
};

/**
 * createCloneProxyWithOwner() Creates a new identity with the ecrecover address as the owner
 * @param logic The address to use for the logic contract
 * @param owner The initial owner's address of the new contract
 * @param opts  Optional. Configuration overrides, such as from address, if any
 * @returns     A contract receipt promise
 */
export const createCloneProxyWithOwner = async (
  owner: EthereumAddress,
  logic?: EthereumAddress
): Promise<ContractTransaction> => {
  if (!logic) logic = await getIdentityContractAddress();
  const contract = await getProxyFactoryContract();
  return contract.createCloneProxyWithOwner(logic, owner);
};

/**
 * createBeaconProxy(beacon: EthereumAddress) Creates a new identity with the message sender as the owner
 * @param beacon The beacon address to use logic contract resolution
 * @returns A contract receipt promise
 */
export const createBeaconProxy = async (beacon: EthereumAddress): Promise<ContractTransaction> => {
  const contract = await getBeaconFactoryContract();
  return contract["createBeaconProxy(address)"](beacon);
};

/**
 * createBeaconProxyWithOwner(beacon: EthereumAddress, owner: EthereumAddress) Creates a new identity with the ecrecover address as the owner
 * @param beacon The beacon address to use logic contract resolution
 * @param owner The initial owner's address of the new contract
 * @returns     A contract receipt promise
 */
export const createBeaconProxyWithOwner = async (
  owner: EthereumAddress,
  beacon: EthereumAddress
): Promise<ContractTransaction> => {
  const contract = await getBeaconFactoryContract();

  return contract.createBeaconProxyWithOwner(beacon, owner);
};

const getIdentityContractAddress = async (): Promise<EthereumAddress> => {
  const {
    provider,
    contracts: { identity },
  } = getConfig();
  if (!provider) throw MissingProvider;
  const address = identity || (await getContractAddress(provider, IDENTITY_CONTRACT));

  if (!address) throw MissingContract;
  return address;
};

const getProxyFactoryContract = async (): Promise<IdentityCloneFactory> => {
  const {
    provider,
    signer,
    contracts: { identityCloneFactory },
  } = getConfig();
  if (!signer) throw MissingSigner;
  if (!provider) throw MissingProvider;

  const address = identityCloneFactory || (await getContractAddress(provider, IDENTITY_CLONE_FACTORY_CONTRACT));
  if (!address) throw MissingContract;

  return IdentityCloneFactory__factory.connect(address, signer);
};

const getBeaconFactoryContract = async (): Promise<BeaconFactory> => {
  const {
    signer,
    provider,
    contracts: { beaconFactory },
  } = getConfig();
  if (!signer) throw MissingSigner;
  if (!provider) throw MissingProvider;

  const address = beaconFactory || (await getContractAddress(provider, BEACON_CONTRACT));
  if (!address) throw MissingContract;

  return BeaconFactory__factory.connect(address, signer);
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

  return Identity__factory.connect(contractAddress, provider).isAuthorizedTo(address, permission, blockNumber);
};
