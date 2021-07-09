import { ContractTransaction } from "ethers";
import { ConfigOpts, requireGetProvider, requireGetSigner, getContracts } from "../../config";
import { MissingProviderConfigError } from "../config/configErrors";
import { DSNPError } from "../errors";
import { EthereumAddress, HexString } from "../../types/Strings";
import {
  IdentityCloneFactory,
  BeaconFactory,
  BeaconFactory__factory,
  Identity__factory,
  IdentityCloneFactory__factory,
} from "../../types/typechain";
import {
  TypedMessageDataField,
  TypedData,
  TypedDataField,
  createTypedData,
  EIP712Signature,
  TypedDomainData,
} from "./utilities";
import { getContractAddress } from "./contract";
import { Provider } from "@ethersproject/providers";
const IDENTITY_CLONE_FACTORY_CONTRACT = "IdentityCloneFactory";
const IDENTITY_CONTRACT = "Identity";
const BEACON_FACTORY_CONTRACT = "BeaconFactory";
const BEACON_CONTRACT = "Beacon";

/**
 * DelegationRole represents a struct for adding roles delegates
 */
export enum DelegationRole {
  NONE = 0x0,
  OWNER = 0x1,
  ANNOUNCER = 0x2,
}

export enum Permission {
  NONE,
  ANNOUNCE,
  OWNERSHIP_TRANSFER,
  DELEGATE_ADD,
  DELEGATE_REMOVE,
}

/**
 * createCloneProxy(logic?: Ethereum Address) Creates a new identity with the message sender as the owner
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
 * createAndRegisterBeaconProxy() Create a new identity and register
 * it to a handle to get a new DSNP Id. This will create and register
 * a new beacon proxy identity.
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

  if (!address) throw new DSNPError("Missing contract!");
  return address;
};

const getIdentityCloneFactoryContract = async (opts?: ConfigOpts): Promise<IdentityCloneFactory> => {
  const { identityCloneFactory } = getContracts(opts);
  const signer = requireGetSigner(opts);
  const provider = requireGetProvider(opts);

  const address = identityCloneFactory || (await getContractAddress(provider, IDENTITY_CLONE_FACTORY_CONTRACT));
  if (!address) throw new DSNPError("Missing contract!");

  return IdentityCloneFactory__factory.connect(address, signer);
};

const getBeaconFactoryContract = async (opts?: ConfigOpts): Promise<BeaconFactory> => {
  const { beaconFactory } = getContracts(opts);
  const signer = requireGetSigner(opts);
  const provider = requireGetProvider(opts);

  const address = beaconFactory || (await getContractAddress(provider, BEACON_FACTORY_CONTRACT));
  if (!address) throw new DSNPError("Missing contract!");

  return BeaconFactory__factory.connect(address, signer);
};

/**
 * isAuthorizedTo() Checks to see if address is authorized with the given permission
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
  if (!provider) throw new MissingProviderConfigError();

  return Identity__factory.connect(contractAddress, provider).isAuthorizedTo(address, permission, blockNumber);
};

const getBeaconAddress = async (opts?: ConfigOpts): Promise<EthereumAddress> => {
  const { beacon } = getContracts(opts);
  const provider = requireGetProvider(opts);
  const address = beacon || (await getContractAddress(provider as Provider, BEACON_CONTRACT));

  if (!address) throw new DSNPError("Missing contract!");
  return address;
};

/**
 * DelegateAdd represents a struct for adding delegates
 */
interface DelegateAdd extends TypedMessageDataField {
  nonce: number;
  delegateAddr: HexString;
  role: DelegationRole;
}

/**
 * DelegateAddParams represents a partial struct for adding delegates
 */
export interface DelegateAddParams {
  nonce?: number;
  delegateAddr: HexString;
  role: DelegationRole;
}

/**
 * getDomainSeparator() Gets unique data that identifies the Identity contract to prevent phishing attacks
 *
 * @param contractAddress - Address of the identity contract to use
 * @param opts - Optional. Configuration overrides, such as store, if any
 * @returns A EIP-712 domain structure that is unique to the Identity contract
 */
export const getDomainSeparator = async (
  contractAddress: EthereumAddress,
  opts?: ConfigOpts
): Promise<TypedDomainData> => {
  const provider = requireGetProvider(opts);

  return {
    name: "Identity",
    version: "1",
    chainId: (await provider.getNetwork()).chainId,
    verifyingContract: contractAddress,
    salt: "0xa0bec69846cdcc8c1ba1eb93be1c5728385a9e26062a73e238b1beda189ac4c9",
  };
};

/**
 * createAddDelegateEip712TypedData() Allows users to create typed structure data for signing addDelegate messages
 * following the EIP-712 standard.
 *
 * @param contractAddress - Address of the identity contract to use
 * @param message - The DelegateAdd message to be signed
 * @param opts - Optional. Configuration overrides, such as store, if any
 * @returns Typed structure data for signing addDelegate messages
 */
export const createAddDelegateEip712TypedData = async (
  contractAddress: EthereumAddress,
  message: DelegateAddParams,
  opts?: ConfigOpts
): Promise<TypedData> => {
  const primaryType = "DelegateAdd";
  const addDelegateType: TypedDataField[] = [
    { name: "nonce", type: "uint32" },
    { name: "delegateAddr", type: "address" },
    { name: "role", type: "uint8" },
  ];

  const delegateAddMessage: DelegateAdd = {
    nonce: message.nonce || (await getNonceForDelegate(contractAddress, message.delegateAddr)),
    ...message,
  };
  const domainData = await getDomainSeparator(contractAddress, opts);

  return createTypedData(domainData, primaryType, delegateAddMessage, { DelegateAdd: addDelegateType });
};

/**
 * getNonceForDelegate() Get a delegate's nonce
 * following the EIP-712 standard.
 *
 * @param contractAddress - Address of the identity contract to use
 * @param delegateAddress - The delegate's address to get the nonce for
 * @param opts - Optional. Configuration overrides, such as store, if any
 * @returns nonce value for delegate
 */
export const getNonceForDelegate = async (
  contractAddress: EthereumAddress,
  delegateAddress: EthereumAddress,
  opts?: ConfigOpts
): Promise<number> => {
  const provider = requireGetProvider(opts);

  return await Identity__factory.connect(contractAddress, provider).getNonceForDelegate(delegateAddress);
};

/**
 * upsertDelegateBySignature() Add or change permissions for delegate using EIP-712 signature
 *
 * @param contractAddress - Address of the identity contract to use
 * @param signature - ECDSA signature r value, s value and EIP-155 calculated Signature v value
 * @param message - DelegateAdd data containing new delegate address, role, and nonce
 * @param opts - delegateadd data containing new delegate address, role, and nonce
 */
export const upsertDelegateBySignature = async (
  contractAddress: EthereumAddress,
  signature: EIP712Signature,
  message: DelegateAdd,
  opts?: ConfigOpts
): Promise<ContractTransaction> => {
  const signer = requireGetSigner(opts);
  const provider = requireGetProvider(opts);
  const { v, r, s } = signature;

  const contract = await Identity__factory.connect(contractAddress, provider);
  return contract.connect(signer).delegateByEIP712Sig(v, r, s, message);
};

/**
 * upsertDelegate() Add or change permissions for delegate
 *
 * @param contractAddress - Address of the identity contract to use
 * @param address - Address of delegate to add permissions to
 * @param role - The role to give delegate
 * @param opts - Optional. Configuration overrides, such as from address, if any
 */
export const upsertDelegate = async (
  contractAddress: EthereumAddress,
  address: EthereumAddress,
  role: DelegationRole,
  opts?: ConfigOpts
): Promise<ContractTransaction> => {
  const signer = requireGetSigner(opts);
  const provider = requireGetProvider(opts);
  const contract = await Identity__factory.connect(contractAddress, provider);

  return contract.connect(signer).delegate(address, role);
};
