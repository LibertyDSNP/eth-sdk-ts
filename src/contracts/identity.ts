import { ContractTransaction } from "ethers";
import { MissingProvider, MissingSigner, MissingContract } from "../utilities/errors";
import { getConfig } from "../config/config";
import { EthereumAddress } from "../types/Strings";
import {
  IdentityCloneFactory,
  BeaconFactory,
  BeaconFactory__factory,
  Identity__factory,
  IdentityCloneFactory__factory,
} from "../types/typechain";
import { getContractAddress } from "./contract";
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
 * @param logic The address to use for the logic contract
 * @returns     A contract receipt promise
 */
export const createCloneProxy = async (logic?: EthereumAddress): Promise<ContractTransaction> => {
  if (!logic) logic = await getIdentityLogicContractAddress();
  const contract = await getIdentityCloneFactoryContract();
  return contract.createCloneProxy(logic);
};

/**
 * createCloneProxyWithOwner() Creates a new identity with the ecrecover address as the owner
 * @param logic The address to use for the logic contract
 * @param owner The initial owner's address of the new contract
 * @returns     A contract receipt promise
 */
export const createCloneProxyWithOwner = async (
  owner: EthereumAddress,
  logic?: EthereumAddress
): Promise<ContractTransaction> => {
  if (!logic) logic = await getIdentityLogicContractAddress();
  const contract = await getIdentityCloneFactoryContract();
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

/**
 * Create a new identity and register it to a handle to get a new DSNP Id.
 * This will create and register a new beacon proxy identity.
 *
 * @param userAddress User's public key address
 * @param handle The string handle to register
 * @returns The contract Transaction
 */
export const createAndRegisterBeaconProxy = async (
  userAddress: EthereumAddress,
  handle: string
): Promise<ContractTransaction> => {
  const beaconFactory = await getBeaconFactoryContract();
  const beaconAddr = await getBeaconAddress();
  const { signer } = getConfig();
  if (!signer) throw MissingSigner;
  return await beaconFactory.createAndRegisterBeaconProxy(beaconAddr, userAddress, handle);
};

const getIdentityLogicContractAddress = async (): Promise<EthereumAddress> => {
  const {
    provider,
    contracts: { identityLogic },
  } = getConfig();
  if (!provider) throw MissingProvider;
  const address = identityLogic || (await getContractAddress(provider, IDENTITY_CONTRACT));

  if (!address) throw MissingContract;
  return address;
};

const getIdentityCloneFactoryContract = async (): Promise<IdentityCloneFactory> => {
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

  const address = beaconFactory || (await getContractAddress(provider, BEACON_FACTORY_CONTRACT));
  if (!address) throw MissingContract;

  return BeaconFactory__factory.connect(address, signer);
};

/**
 * Checks to see if address is authorized with the given permission
 * @param addr Address that is used to test permission
 * @param contractAddress Address of contract to check against
 * @param permission Level of permission check. See Permission for details
 * @param blockNumber Check for authorization at a particular block number, 0x0 reserved for endless permissions
 * @return boolean
 * @dev Return MAY change as deauthorization can revoke past messages
 */

export const isAuthorizedTo = async (
  address: EthereumAddress,
  contractAddress: EthereumAddress,
  permission: Permission,
  blockNumber: number
): Promise<boolean> => {
  const { provider } = await getConfig();
  if (!provider) throw MissingProvider;

  return Identity__factory.connect(contractAddress, provider).isAuthorizedTo(address, permission, blockNumber);
};

const getBeaconAddress = async (): Promise<EthereumAddress> => {
  const {
    provider,
    contracts: { beacon },
  } = getConfig();
  if (!provider) throw MissingProvider;
  const address = beacon || (await getContractAddress(provider, BEACON_CONTRACT));

  if (!address) throw MissingContract;
  return address;
};
