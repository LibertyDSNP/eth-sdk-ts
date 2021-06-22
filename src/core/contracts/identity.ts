import { ContractTransaction } from "ethers";
import {
  ConfigOpts,
  requireGetProvider,
  MissingProvider,
  MissingContract,
  requireGetSigner,
  getContracts,
} from "../../config";
import { EthereumAddress } from "../../types/Strings";
import {
  IdentityCloneFactory,
  BeaconFactory,
  BeaconFactory__factory,
  Identity__factory,
  IdentityCloneFactory__factory,
} from "../../types/typechain";
import { getContractAddress } from "./contract";
import { Provider } from "@ethersproject/providers";
const IDENTITY_CLONE_FACTORY_CONTRACT = "IdentityCloneFactory";
const IDENTITY_CONTRACT = "Identity";
const BEACON_FACTORY_CONTRACT = "BeaconFactory";
const BEACON_CONTRACT = "Beacon";

export enum Permission {
  NONE,
  ANNOUNCE,
  OWNERSHIP_TRANSFER,
  DELEGATE_ADD,
  DELEGATE_REMOVE,
}
/**
 * createCloneProxy(logic?: Ethereum Address ) Creates a new identity with the message sender as the owner
 *
 * @param logic - The address to use for the logic contract
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A contract receipt promise
 */
export const createCloneProxy = async (logic?: EthereumAddress, opts?: ConfigOpts): Promise<ContractTransaction> => {
  if (!logic) logic = await getIdentityLogicContractAddress(opts);
  const contract = await getIdentityCloneFactoryContract(opts);
  return contract.createCloneProxy(logic);
};

/**
 * createCloneProxyWithOwner() Creates a new identity with the ecrecover address as the owner
 *
 * @param owner - The initial owner's address of the new contract
 * @param logic - The address to use for the logic contract
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A contract receipt promise
 */
export const createCloneProxyWithOwner = async (
  owner: EthereumAddress,
  logic?: EthereumAddress,
  opts?: ConfigOpts
): Promise<ContractTransaction> => {
  if (!logic) logic = await getIdentityLogicContractAddress(opts);
  const contract = await getIdentityCloneFactoryContract(opts);
  return contract.createCloneProxyWithOwner(logic, owner);
};

/**
 * createBeaconProxy(beacon: EthereumAddress) Creates a new identity with the message sender as the owner
 *
 * @param beacon - The beacon address to use logic contract resolution
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A contract receipt promise
 */
export const createBeaconProxy = async (beacon: EthereumAddress, opts?: ConfigOpts): Promise<ContractTransaction> => {
  const contract = await getBeaconFactoryContract(opts);
  return contract["createBeaconProxy(address)"](beacon);
};

/**
 * createBeaconProxyWithOwner(beacon: EthereumAddress, owner: EthereumAddress) Creates a new identity with the ecrecover address as the owner
 *
 * @param owner - The initial owner's address of the new contract
 * @param beacon - The beacon address to use logic contract resolution
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A contract receipt promise
 */
export const createBeaconProxyWithOwner = async (
  owner: EthereumAddress,
  beacon: EthereumAddress,
  opts?: ConfigOpts
): Promise<ContractTransaction> => {
  const contract = await getBeaconFactoryContract(opts);
  return contract.createBeaconProxyWithOwner(beacon, owner);
};

/**
 * Create a new identity and register it to a handle to get a new DSNP Id.
 * This will create and register a new beacon proxy identity.
 *
 * @param userAddress - User's public key address
 * @param handle - The string handle to register
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns The contract Transaction
 */
export const createAndRegisterBeaconProxy = async (
  userAddress: EthereumAddress,
  handle: string,
  opts?: ConfigOpts
): Promise<ContractTransaction> => {
  const beaconFactory = await getBeaconFactoryContract(opts);
  const beaconAddr = await getBeaconAddress(opts);
  return await beaconFactory.createAndRegisterBeaconProxy(beaconAddr, userAddress, handle);
};

const getIdentityLogicContractAddress = async (opts?: ConfigOpts): Promise<EthereumAddress> => {
  const { identityLogic } = getContracts(opts);
  const provider = requireGetProvider(opts);

  const address = identityLogic || (await getContractAddress(provider, IDENTITY_CONTRACT));

  if (!address) throw MissingContract;
  return address;
};

const getIdentityCloneFactoryContract = async (opts?: ConfigOpts): Promise<IdentityCloneFactory> => {
  const { identityCloneFactory } = getContracts(opts);
  const signer = requireGetSigner(opts);
  const provider = requireGetProvider(opts);

  const address = identityCloneFactory || (await getContractAddress(provider, IDENTITY_CLONE_FACTORY_CONTRACT));
  if (!address) throw MissingContract;

  return IdentityCloneFactory__factory.connect(address, signer);
};

const getBeaconFactoryContract = async (opts?: ConfigOpts): Promise<BeaconFactory> => {
  const { beaconFactory } = getContracts(opts);
  const signer = requireGetSigner(opts);
  const provider = requireGetProvider(opts);

  const address = beaconFactory || (await getContractAddress(provider, BEACON_FACTORY_CONTRACT));
  if (!address) throw MissingContract;

  return BeaconFactory__factory.connect(address, signer);
};

/**
 * Checks to see if address is authorized with the given permission
 *
 * @param address - Address that is used to test permission
 * @param contractAddress - Address of contract to check against
 * @param permission - Level of permission check. See Permission for details
 * @param blockNumber - Check for authorization at a particular block number,
 *        0x0 reserved for endless permissions
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns boolean
 */
export const isAuthorizedTo = async (
  address: EthereumAddress,
  contractAddress: EthereumAddress,
  permission: Permission,
  blockNumber: number,
  opts?: ConfigOpts
): Promise<boolean> => {
  const provider = requireGetProvider(opts);
  if (!provider) throw MissingProvider;

  return Identity__factory.connect(contractAddress, provider).isAuthorizedTo(address, permission, blockNumber);
};

const getBeaconAddress = async (opts?: ConfigOpts): Promise<EthereumAddress> => {
  const { beacon } = getContracts(opts);
  const provider = requireGetProvider(opts);
  const address = beacon || (await getContractAddress(provider as Provider, BEACON_CONTRACT));

  if (!address) throw MissingContract;
  return address;
};
