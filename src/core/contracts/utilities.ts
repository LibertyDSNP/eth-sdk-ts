import { ethers } from "ethers";
import { HexString } from "../../types/Strings";

/**
 * DomainData represents EIP-712 unique domain
 */
export type TypedDomainData = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
  salt: string;
};

/**
 * TypedData represents EIP-712 complete typed data
 */
export interface TypedData {
  types: Record<string, Array<TypedDataField>>;
  primaryType: string;
  domain: TypedDomainData;
  message: Record<string, unknown>;
}

export type TypedMessageDataField = Record<string, unknown>;

/**
 * EIP712Signature represents a ECDSA r value, s value and EIP-155 calculated Signature v value
 */
export type EIP712Signature = { r: string; s: string; v: number };

/**
 * TypedDataField represents a single type
 */
export interface TypedDataField {
  name: string;
  type: string;
}

const EIP712_DOMAIN_TYPES: TypedDataField[] = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
  { name: "salt", type: "bytes32" },
];

/**
 * createTypedData() Allows users to create a JSON-Schema definition for EIP-712 TypedData params.
 *
 * @param domainData - Unique data that identifies a contract to prevent phishing attacks
 * @param primaryType - A top-level type
 * @param message - The message to be signed
 * @param messageTypes - A set of all structured types for messages
 * @returns Typed structured data to be signed
 */
export const createTypedData = (
  domainData: TypedDomainData,
  primaryType: string,
  message: TypedMessageDataField,
  messageTypes: Record<string, Array<TypedDataField>>
): TypedData => {
  return {
    types: {
      EIP712Domain: EIP712_DOMAIN_TYPES,
      ...messageTypes,
    },
    domain: domainData,
    primaryType,
    message,
  };
};

/**
 * LogEventData represents a struct for log data
 */
export interface LogEventData {
  transactionHash: HexString;
  blockNumber: number;
}

/**
 * UnsubscribeFunction represents a function to unsubscribe to events
 */
export type UnsubscribeFunction = () => void;

/**
 * subscribeToEvent() allows users to subscribe to new incoming event
 * and also get events prior the current block.
 *
 * @param provider - initialized provider
 * @param filter - a filter to filter block events
 * @param doReceiveEvent - a callback that handles incoming event logs
 * @param fromBlock - a block number to start receiving event logs
 * @returns An unsubscribe function
 */
export const subscribeToEvent = async (
  provider: ethers.providers.Provider,
  filter: ethers.EventFilter,
  doReceiveEvent: (log: ethers.providers.Log) => void,
  fromBlock?: number
): Promise<UnsubscribeFunction> => {
  if (!fromBlock) {
    provider.on(filter, doReceiveEvent);

    return () => provider.off(filter);
  }

  const currentBlockNumber = await provider.getBlockNumber();
  const newLogsQueue: ethers.providers.Log[] = [];
  let isFetchingPastLogData = true;

  provider.on(filter, (log: ethers.providers.Log) => {
    if (log.blockNumber < fromBlock) return;
    if (log.blockNumber <= currentBlockNumber) return;

    if (isFetchingPastLogData) {
      newLogsQueue.push(log);
    } else {
      doReceiveEvent(log);
    }
  });

  const pastLogs = await provider.getLogs({
    ...filter,
    fromBlock: fromBlock,
    toBlock: currentBlockNumber,
  });

  [...pastLogs, ...newLogsQueue].forEach((log) => {
    doReceiveEvent(log);
  });

  isFetchingPastLogData = false;

  return () => {
    provider.off(filter);
  };
};
