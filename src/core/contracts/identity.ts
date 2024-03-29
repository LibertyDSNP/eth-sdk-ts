import { ContractTransaction, ethers } from "ethers";
import { ConfigOpts, requireGetDsnpStartBlockNumber, requireGetProvider, requireGetSigner } from "../config";
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
  LogEventData,
} from "./utilities";
import { getContractAddress } from "./contract";
import { Provider } from "@ethersproject/providers";
import { ParsedLog } from "./subscription";
import { hash } from "../utilities";
const IDENTITY_CLONE_FACTORY_CONTRACT = "IdentityCloneFactory";
const IDENTITY_CONTRACT = "Identity";
const BEACON_FACTORY_CONTRACT = "BeaconFactory";
const BEACON_CONTRACT = "Beacon";
const IDENTITY_DECODER = new ethers.utils.Interface(Identity__factory.abi);

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
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the clone proxy factory contract address cannot be found.
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
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the clone proxy factory contract address cannot be found.
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
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the beacon proxy factory contract address cannot be found.
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
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the beacon proxy factory contract address cannot be found.
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
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingContractAddressError}
 * Thrown if the beacon proxy factory contract address cannot be found.
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
  const provider = requireGetProvider(opts);
  const address = await getContractAddress(provider, IDENTITY_CONTRACT, opts);
  return address;
};

const getIdentityCloneFactoryContract = async (opts?: ConfigOpts): Promise<IdentityCloneFactory> => {
  const signer = requireGetSigner(opts);
  const provider = requireGetProvider(opts);
  const address = await getContractAddress(provider, IDENTITY_CLONE_FACTORY_CONTRACT, opts);

  return IdentityCloneFactory__factory.connect(address, signer);
};

const getBeaconFactoryContract = async (opts?: ConfigOpts): Promise<BeaconFactory> => {
  const signer = requireGetSigner(opts);
  const provider = requireGetProvider(opts);
  const address = await getContractAddress(provider, BEACON_FACTORY_CONTRACT, opts);

  return BeaconFactory__factory.connect(address, signer);
};

/**
 * isAuthorizedTo() Checks to see if address is authorized with the given permission
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
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

  return Identity__factory.connect(contractAddress, provider).isAuthorizedTo(address, permission, blockNumber);
};

const getBeaconAddress = async (opts?: ConfigOpts): Promise<EthereumAddress> => {
  const provider = requireGetProvider(opts);
  const address = await getContractAddress(provider as Provider, BEACON_CONTRACT, opts);
  return address;
};

interface DelegateAddLogData {
  name: string;
  identityAddress: HexString;
  delegate: HexString;
}

interface DelegateRemoveLogData extends DelegateAddLogData {
  endBlock: number;
}

/**
 * DelegateLogData represents a struct for log data
 */
export type DelegateLogData = (DelegateAddLogData | DelegateRemoveLogData) & LogEventData;

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
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
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
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
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
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
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
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
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

/**
 * removeDelegate() Remove all permissions for delegate
 *
 * @param contractAddress - Address of the identity contract to use
 * @param address - Address of delegate to which permissions will be removed
 * @param endBlock - The block number that permission will be revoked
 * @param opts - Optional. Configuration overrides, such as from address, if any
 */
export const removeDelegate = async (
  contractAddress: EthereumAddress,
  address: EthereumAddress,
  endBlock: DelegationRole,
  opts?: ConfigOpts
): Promise<ContractTransaction> => {
  const signer = requireGetSigner(opts);
  const provider = requireGetProvider(opts);
  const contract = await Identity__factory.connect(contractAddress, provider);

  return contract.connect(signer).delegateRemove(address, endBlock);
};

/**
 * getDelegateIdentitiesFor() Retrieves all identities for an address
 *
 * @param ethereumAddress - The address to find all active identities associated to it
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A list of idenetity addresses that the input address is a delegate to
 */
export const getDelegateIdentitiesFor = async (
  ethereumAddress: EthereumAddress,
  opts?: ConfigOpts
): Promise<EthereumAddress[]> => {
  const delegateLogData: DelegateLogData[] = siftDelegateLogs(await getAllDelegateLogsFor(ethereumAddress, opts));

  const activeIdentities = (await resolveDelegatesFor(ethereumAddress, delegateLogData)).map(
    (data: DelegateLogData) => data?.identityAddress
  );

  return activeIdentities;
};

/**
 * resolveDelegatesFor()
 *
 * @param ethereumAddress - The address to find all active identities associated to it
 * @param delegateLogData - Sorted by block-number unfiltered log data from the Add/Remove Delegate events
 * the Add/Remove Delegate events (DSNPAddDelegate and DSNPRemoveDelegate)
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns Filtered logs to which the input address is a delegate to
 */
export const resolveDelegatesFor = async (
  ethereumAddress: EthereumAddress,
  delegateLogData: DelegateLogData[],
  opts?: ConfigOpts
): Promise<DelegateLogData[]> => {
  const provider = requireGetProvider(opts);

  const currentBlockNumber = await provider.getBlockNumber();
  const isRemoved = (delegate: DelegateRemoveLogData): boolean => delegate.endBlock <= currentBlockNumber;

  const lastLogForIdentityAddress = getLastLogForIdentityAddress(delegateLogData);

  const filteredDelegateLogData = lastLogForIdentityAddress.filter((delegate: DelegateLogData) => {
    return (
      delegate.delegate.toLowerCase() == ethereumAddress.toLowerCase() &&
      (isDelegateAddLogData(delegate) || (isDelegateRemoveLogData(delegate) && !isRemoved(delegate)))
    );
  });

  return filteredDelegateLogData;
};

const isDelegateRemoveLogData = (
  delegate: DelegateAddLogData | DelegateRemoveLogData
): delegate is DelegateRemoveLogData => {
  return (delegate as DelegateRemoveLogData).name === "DSNPRemoveDelegate";
};

const isDelegateAddLogData = (delegate: DelegateAddLogData | DelegateRemoveLogData): delegate is DelegateAddLogData => {
  return (delegate as DelegateAddLogData).name === "DSNPAddDelegate";
};

const getLastLogForIdentityAddress = (delegateLogs: DelegateLogData[]): DelegateLogData[] => {
  const groupedByIdentityAddress = delegateLogs.reduce(
    (acc: Record<HexString, DelegateLogData>, current: DelegateLogData) => {
      acc[current.identityAddress] = current;

      return acc;
    },
    {}
  );

  return Object.values(groupedByIdentityAddress);
};

/**
 * getAllDelegateLogsFor() Retrieves all logs associated to an address
 *
 * @param ethereumAddress - Address used to retrive all delegate logs for
 * @param opts - Optional. Configuration overrides, such as from address, if any
 */
export const getAllDelegateLogsFor = async (
  ethereumAddress: EthereumAddress,
  opts?: ConfigOpts
): Promise<ParsedLog[]> => {
  const provider = requireGetProvider(opts);

  const addDelegateEventSignature = hash("DSNPAddDelegate(address,uint8)");
  const removeDelegateEventSignature = hash("DSNPRemoveDelegate(address,uint64)");

  const logs: ethers.providers.Log[] = await provider.getLogs({
    topics: [[removeDelegateEventSignature, addDelegateEventSignature], [ethers.utils.hexZeroPad(ethereumAddress, 32)]],
    fromBlock: requireGetDsnpStartBlockNumber(opts),
  });

  return logs.map((log: ethers.providers.Log) => {
    const fragment = IDENTITY_DECODER.parseLog(log);
    return { fragment, log: log };
  });
};

/**
 * siftDelegateLogs() Sifts data from delegate add and remove logs
 *
 * @param logs - delegate event logs
 * @returns DelegateLogData
 */
const siftDelegateLogs = (logs: ParsedLog[]): DelegateLogData[] => {
  return logs.map((item: ParsedLog) => {
    const {
      fragment: {
        args: { delegate, endBlock },
        name,
      },
      log: { address, blockNumber, transactionHash, transactionIndex, logIndex },
    } = item;

    return {
      name,
      identityAddress: address,
      delegate: delegate,
      transactionHash,
      blockNumber,
      ...(endBlock !== undefined ? { endBlock: endBlock.toNumber() } : {}),
      logIndex,
      transactionIndex,
    };
  });
};
