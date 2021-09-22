import { ethers } from "ethers";
import { HexString } from "../../types/Strings";
import { ConfigOpts, requireGetDsnpStartBlockNumber, requireGetProvider } from "../config";
import { EventFilter } from "ethers/lib/ethers";
import { Log as EventLog } from "@ethersproject/abstract-provider";
import { DSNPError } from "../errors";
import { BatchPublicationLogData, decodeLogsForBatchPublication } from "./subscription";

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
  transactionIndex: number;
  logIndex: number;
}

/**
 * UnsubscribeFunction represents a function to unsubscribe to events
 */
export type UnsubscribeFunction = () => void;

/**
 * Block Number
 * Numerical
 * "latest" for current block
 * "dsnp-start-block" for the config dsnpStartBlockNumber
 */
export type FromBlockNumber = number | "dsnp-start-block" | "latest" | "earliest";

/**
 * Convert a user block value to an actual block number.
 * Defaults to "latest" for subscription needs
 *
 * @param userFromBlock - undefined results in using defaultTo
 * @param defaultTo - undefined = latest or 0 or dsnp-start-block?
 * @param opts - (optional) any config overrides.
 * @returns A block number or "latest"
 */
export const getFromBlockDefault = (
  userFromBlock: FromBlockNumber | undefined,
  defaultTo: 0 | "latest" | "dsnp-start-block",
  opts?: ConfigOpts
): number | "latest" => {
  if (userFromBlock === undefined) {
    if (defaultTo === "dsnp-start-block") return requireGetDsnpStartBlockNumber(opts);
    return defaultTo;
  }
  if (userFromBlock === "earliest") return 0;
  if (userFromBlock === "dsnp-start-block") return requireGetDsnpStartBlockNumber(opts);
  return userFromBlock;
};

/**
 * subscribeToEvent() allows users to subscribe to new incoming event
 * and also get events prior the current block.
 *
 * @param provider - initialized provider
 * @param filter - a filter to filter block events
 * @param doReceiveEvent - a callback that handles incoming event logs
 * @param fromBlock - a block number to start receiving event logs. Defaults to "latest", supports number or "dsnp-start-block"
 * @returns An unsubscribe function
 */
export const subscribeToEvent = async (
  provider: ethers.providers.Provider,
  filter: ethers.EventFilter,
  doReceiveEvent: (log: ethers.providers.Log) => void,
  fromBlock: number | "latest" = "latest"
): Promise<UnsubscribeFunction> => {
  if (fromBlock === "latest") {
    provider.on(filter, doReceiveEvent);

    return () => provider.off(filter);
  }

  const newLogsQueue: ethers.providers.Log[] = [];
  let isFetchingPastLogData = true;

  /**
   * ethers provider.on works by using the provider's cached blockNumber
   * provider.on will poll forward using the cached blockNumber (if it is not stale)
   * As long as provider.on is called within 2.1 seconds of provider.getBlockNumber's response
   * the provider.on will start with the same block number as "currentBlockNumber"
   * To get previous logs, we fetch all logs up to currentBlockNumber INCLUSIVE
   * and leave provider.on to be from currentBlockNumber on EXCLUSIVE
   */
  const currentBlockNumber = await provider.getBlockNumber();

  provider.on(filter, (log: ethers.providers.Log) => {
    if (log.blockNumber < fromBlock) return;
    // Getting currentBlockNumber results from getLogs
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

/**
 * BlockRangeOptions: represents parameters for specifying chain filter and block limits.
 */
export type BlockRangeOptions = {
  filter: EventFilter;
  walkbackBlocks: number;
  latestBlock: number;
  earliestBlock: number;
};

export const MAX_ITERATOR_WALKBACK_BLOCKS = 10000;

/**
 *  AsyncPublicationsIterator is an AsyncIterator which implements only an async next() function.
 *  Lazily fetches log events from the chain based on a Publications filter, walkbackBlocks
 *  and a range of blocks provided in the constructor.  When logs are found, they are
 *  decoded into Publications.
 */
export class AsyncPublicationsIterator {
  currentStartBlock: number;
  currentEndBlock: number;
  logIndex: number;
  publications: Array<BatchPublicationLogData>;
  provider: ethers.providers.Provider;
  blockRangeOptions: BlockRangeOptions;

  /**
   *
   * @param rangeOptions - BlockRangeOptions for fetching publications
   * @param provider - ethers.providers.Provider
   */
  constructor(rangeOptions: BlockRangeOptions, provider: ethers.providers.Provider) {
    this.blockRangeOptions = rangeOptions;
    this.currentEndBlock = rangeOptions.latestBlock;
    this.currentStartBlock = rangeOptions.latestBlock - rangeOptions.walkbackBlocks + 1;
    this.provider = provider;
    this.logIndex = 0;
    this.publications = [];
  }

  reachedEarliestBlock(): boolean {
    return this.currentEndBlock < this.blockRangeOptions.earliestBlock;
  }

  // we should fetch logs from the chain initially or if we've returned the last item
  // fetched last time.
  shouldFetchLogs(): boolean {
    return !this.publications.length || this.logIndex === this.publications.length - 1;
  }

  doneFetching(): boolean {
    return this.reachedEarliestBlock() && this.logIndex === this.publications.length;
  }

  async fetchUntilGetLogsOrDone(): Promise<void> {
    let logs: EventLog[] = [];
    // keep going until we get something or we hit the earliest requested block height.
    while (!logs.length && !this.reachedEarliestBlock()) {
      logs = await this.provider.getLogs({
        address: this.blockRangeOptions.filter.address,
        topics: this.blockRangeOptions.filter.topics,
        fromBlock: this.currentStartBlock,
        toBlock: this.currentEndBlock,
      });
      this.currentEndBlock = this.currentStartBlock - 1;
      this.currentStartBlock = Math.max(
        this.currentStartBlock - this.blockRangeOptions.walkbackBlocks,
        this.blockRangeOptions.earliestBlock
      );
    }
    this.logIndex = 0;
    this.publications = decodeLogsForBatchPublication(logs);
    return;
  }

  /**
   * next - returns a Promise of an IteratorResult enclosing a Publication.
   * IteratorResult = \{
   *    done: true if the earliest block has been reached AND the last Publication has
   *          been returned via next().
   *    value: a Publication
   * \}
   */
  public async next(): Promise<IteratorResult<BatchPublicationLogData>> {
    if (this.shouldFetchLogs()) {
      await this.fetchUntilGetLogsOrDone();
    } else {
      this.logIndex++;
    }
    return Promise.resolve({ done: this.doneFetching(), value: this.publications[this.logIndex] });
  }
}

const requirePositive = (value: number, name: string) => {
  if (value < 0) {
    throw new DSNPError(`${name} must be > 0`);
  }
};

const requireValidBlockRange = (newestBlock?: number, oldestBlock?: number) => {
  if (newestBlock) requirePositive(newestBlock, "newestBlock");
  if (oldestBlock) requirePositive(oldestBlock, "oldestBlock");
  if (newestBlock && oldestBlock && oldestBlock >= newestBlock) {
    throw new DSNPError("newestBlock must be greater than oldestBlock");
  }
};

const requireValidWalkback = (walkbackBlocks: number) => {
  requirePositive(walkbackBlocks, "walkbackBlocks");
  if (walkbackBlocks > MAX_ITERATOR_WALKBACK_BLOCKS)
    throw new DSNPError("walkbackBlocks must be <= " + MAX_ITERATOR_WALKBACK_BLOCKS);
};

/**
 * getPublicationLogIterator fetches filtered logs based on the provided filter, in the range specified.
 *
 * @param filter - is an ethers EventFilter. It is required.
 * @param walkbackBlocks - is a number. It is required and must be :gt; 0 and &lt; MAX_WALKBACK
 * @param newestBlock - is a number. It is optional and must be :gt;0.  It defaults to the current block height.
 * @param oldestBlock - is a number. It is optional, must be :ge;0 , and defaults to 0.
 * @param opts - ConfigOpts
 */
export const getPublicationLogIterator = async (
  filter: EventFilter,
  walkbackBlocks: number,
  newestBlock?: number,
  oldestBlock?: number,
  opts?: ConfigOpts
): Promise<AsyncPublicationsIterator> => {
  requireValidWalkback(walkbackBlocks);
  requireValidBlockRange(newestBlock, oldestBlock);
  const provider = requireGetProvider(opts);
  const newest = newestBlock || (await provider.getBlockNumber());
  const oldest = oldestBlock === undefined ? 0 : oldestBlock;
  return new AsyncPublicationsIterator(
    {
      earliestBlock: oldest,
      latestBlock: newest,
      walkbackBlocks: Math.min(newest - oldest + 1, walkbackBlocks),
      filter: filter,
    },
    provider
  );
};
