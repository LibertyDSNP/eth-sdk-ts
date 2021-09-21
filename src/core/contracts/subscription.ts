import { HexString } from "../../types/Strings";
import { ethers } from "ethers";
import { ConfigOpts, requireGetProvider } from "../config";
import { dsnpBatchFilter, Publication } from "./publisher";
import { Publisher__factory, Registry } from "../../types/typechain";
import { LogDescription } from "@ethersproject/abi";
import { FromBlockNumber, getFromBlockDefault, LogEventData, subscribeToEvent, UnsubscribeFunction } from "./utilities";
import { getContract, RegistryUpdateLogData } from "./registry";
import { convertToDSNPUserURI } from "../identifiers";
import { EventFilter } from "ethers/lib/ethers";
import { Log as EventLog } from "@ethersproject/abstract-provider";

const PUBLISHER_DECODER = new ethers.utils.Interface(Publisher__factory.abi);

/**
 * BatchPublication represents a struct for a publication data
 */
export interface BatchPublication {
  announcementType: number;
  fileUrl: string;
  fileHash: HexString;
}

/**
 * BatchPublicationLogData represents a struct for batch publication event data
 */
export type BatchPublicationLogData = LogEventData & BatchPublication;

/**
 * ParsedLog: interface for parsing log data
 */
export interface ParsedLog {
  fragment: ethers.utils.LogDescription;
  log: ethers.providers.Log;
}

export interface BatchFilterOptions {
  announcementType?: number;
  fromBlock?: FromBlockNumber;
}

/**
 * BatchPublicationCallback represents a type for publication callback function
 */
export type BatchPublicationCallback = (doReceivePublication: BatchPublicationLogData) => void;

/**
 * subscribeToBatchPublications() sets up a listener to listen to retrieve Batch
 * Publication events from the chain. It takes a callback and a filter. The
 * filter is used to filter events that come through. The callback is invoked
 * for each correctly filtered event.
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @param doReceivePublication - The callback function to be called when an event is received
 * @param filter - Any filter options for including or excluding certain events (supports fromBlock: "latest" (default) | "dsnp-start-block" | number)
 * @returns A function that can be called to remove listener for this type of event
 */
export const subscribeToBatchPublications = async (
  doReceivePublication: BatchPublicationCallback,
  filter?: BatchFilterOptions
): Promise<UnsubscribeFunction> => {
  const provider = requireGetProvider();

  const doReceiveEvent = (log: ethers.providers.Log) => {
    const logItem = decodeLogsForBatchPublication([log])[0];
    doReceivePublication(logItem);
  };

  const batchFilter: ethers.EventFilter = dsnpBatchFilter(filter?.announcementType);

  return subscribeToEvent(provider, batchFilter, doReceiveEvent, getFromBlockDefault(filter?.fromBlock, "latest"));
};

const decodeLogsForBatchPublication = (logs: ethers.providers.Log[]): BatchPublicationLogData[] => {
  return logs
    .map((log: ethers.providers.Log) => {
      try {
        const fragment = PUBLISHER_DECODER.parseLog(log);
        return { fragment, log: log };
      } catch (err) {
        // Catch this error so a single corrupted log won't break all of log retrieval.
        console.log("Error parsing batch publication log", log, err);
        // Return this log will be filtered out in the next step.
        return { fragment: undefined as unknown as LogDescription, log: log };
      }
    })
    .filter((desc: ParsedLog) => desc.fragment && desc.fragment.name === "DSNPBatchPublication")
    .map((item: ParsedLog) => {
      return {
        announcementType: item.fragment.args.announcementType,
        fileHash: item.fragment.args.fileHash,
        fileUrl: item.fragment.args.fileUrl,
        blockNumber: item.log.blockNumber,
        transactionHash: item.log.transactionHash,
        transactionIndex: item.log.transactionIndex,
        logIndex: item.log.logIndex,
      };
    });
};

/**
 * RegistryUpdateSubscriptionFilter filter options for including or excluding certain events
 */
export interface RegistryUpdateSubscriptionFilter {
  fromBlock?: FromBlockNumber;
}

/**
 * RegistryUpdateCallback represents a type for registry update callback function
 */
export type RegistryUpdateCallback = (doReceiveRegistryUpdate: RegistryUpdateLogData) => void;

/**
 * subscribeToRegistryUpdates() sets up a listener to retrieve DSNPRegistryUpdate events
 *
 * @param doReceiveRegistryUpdate - The callback function to be called when an event is received
 * @param filter - Filter options for including or excluding certain events (supports fromBlock: "latest" (default) | "dsnp-start-block" | number)
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns A function that can be called to remove listener for this type of event
 */
export const subscribeToRegistryUpdates = async (
  doReceiveRegistryUpdate: RegistryUpdateCallback,
  filter: RegistryUpdateSubscriptionFilter,
  opts?: ConfigOpts
): Promise<UnsubscribeFunction> => {
  const provider = requireGetProvider();
  const contract = await getContract(opts);

  const registryUpdateFilter = contract.filters.DSNPRegistryUpdate();

  const doReceiveEvent = (log: ethers.providers.Log) => {
    const logItem = decodeLogsForRegistryUpdate([log], contract)[0];
    doReceiveRegistryUpdate(logItem);
  };

  return subscribeToEvent(
    provider,
    registryUpdateFilter,
    doReceiveEvent,
    getFromBlockDefault(filter?.fromBlock, "latest")
  );
};

const decodeLogsForRegistryUpdate = (logs: ethers.providers.Log[], contract: Registry): RegistryUpdateLogData[] => {
  return logs.map((log) => {
    const {
      args: { id, addr, handle },
    } = contract.interface.parseLog(log);
    const { blockNumber, transactionHash } = log;

    return {
      blockNumber,
      transactionHash,
      dsnpUserURI: convertToDSNPUserURI(id),
      contractAddr: addr,
      handle,
      transactionIndex: log.transactionIndex,
      logIndex: log.logIndex,
    };
  });
};

interface BlockRangeOptions {
  filter: EventFilter;
  walkbackBlockCount: number;
  latestBlock: number;
  earliestBlock: number;
}

export interface AsyncIterator<T> {
  next(value?: any): Promise<IteratorResult<T>>;
  return?(value?: any): Promise<IteratorResult<T>>;
  throw?(e?: any): Promise<IteratorResult<T>>;
}

// We need to fetch until we get at least one log, then next
// retrieves each one until we're done.  If we are done with the current collection,
// fetch more based on walkback.

// so we need a "fetch more" indicator
// and a "reached earliest block" indicator.

// 1a. if results are empty
//   while results are empty
//      fetch the next set of items
// 1b. increment logIndex
// 2 Check if we're done:
//     current
class AsyncPublicationsIterator {
  earliestBlock: number;
  walkbackBlocks: number;
  currentStartBlock: number;
  currentEndBlock: number;
  logIndex: number;
  publications: Array<Publication>;
  provider: ethers.providers.Provider;
  filter: EventFilter;

  constructor(rangeOptions: BlockRangeOptions, provider: ethers.providers.Provider) {
    this.earliestBlock = rangeOptions.earliestBlock;
    this.walkbackBlocks = rangeOptions.walkbackBlockCount;
    this.currentEndBlock = rangeOptions.latestBlock;
    this.currentStartBlock = rangeOptions.latestBlock - this.walkbackBlocks + 1;
    this.filter = rangeOptions.filter;
    this.provider = provider;
    this.logIndex = 0;
    this.publications = [];
  }

  reachedEarliestBlock(): boolean {
    return this.currentEndBlock < this.earliestBlock;
  }

  // we should fetch logs from the chain initially or if we've returned the last item
  // fetched last time.
  shouldFetchLogs(): boolean {
    return !this.publications.length || this.logIndex === this.publications.length - 1;
  }

  doneFetching(): boolean {
    return this.reachedEarliestBlock() && this.logIndex === this.publications.length;
  }

  async fetchUntilWeGetSomeLogs() {
    this.publications = [];
    let logs: EventLog[] = [];
    // keep going until we get something or we hit the earliest requested block height.
    while (!logs.length && !this.reachedEarliestBlock()) {
      logs = await this.provider.getLogs({
        topics: this.filter.topics,
        fromBlock: this.currentStartBlock,
        toBlock: this.currentEndBlock,
      });
      this.logIndex = 0;
      this.currentEndBlock = this.currentStartBlock - 1; // check off by 1
      this.currentStartBlock = Math.max(this.currentStartBlock - this.walkbackBlocks, this.earliestBlock);
    }
    this.publications = decodeLogsForBatchPublication(logs);
  }

  public async next(): Promise<IteratorResult<Publication>> {
    if (this.shouldFetchLogs()) {
      await this.fetchUntilWeGetSomeLogs();
    } else {
      this.logIndex++;
    }
    return Promise.resolve({ done: this.doneFetching(), value: this.publications[this.logIndex] });
  }
}

// TODO: what happens when we pass a block > currentBlock? Maybe ethers handles it.
/**
 * syncPublicationsByRange fetches filtered logs based on the provided filter, in the range specified.
 *
 * @param filter - is an ethers EventFilter. It is required.
 * @param walkbackBlockCount - is a number. It is required and must be :gt;0.
 * @param newestBlock - is a number. It is optional and must be :gt;0.  It defaults to the current block height.
 * @param oldestBlock - is a number, is optional.  If it is not provided, it defaults to 0.
 * @param opts - ConfigOpts
 */

export const syncPublicationsByRange = async (
  filter: EventFilter,
  walkbackBlockCount: number,
  newestBlock?: number,
  oldestBlock?: number,
  opts?: ConfigOpts
): Promise<AsyncIterator<Publication>> => {
  const provider = requireGetProvider(opts);
  const latestBlock = newestBlock || (await provider.getBlockNumber());
  const earliestBlock = oldestBlock === undefined ? 0 : oldestBlock;
  return new AsyncPublicationsIterator({ earliestBlock, latestBlock, walkbackBlockCount, filter }, provider);
};
