import { HexString } from "../../types/Strings";
import { ethers } from "ethers";
import { ConfigOpts, requireGetProvider } from "../config";
import { dsnpBatchFilter, Publication } from "./publisher";
import { Publisher__factory, Registry } from "../../types/typechain";
import { LogDescription } from "@ethersproject/abi";
import { FromBlockNumber, getFromBlockDefault, LogEventData, subscribeToEvent, UnsubscribeFunction } from "./utilities";
import { RegistryUpdateLogData, getContract } from "./registry";
import { convertToDSNPUserURI } from "../identifiers";
import { EventFilter } from "ethers/lib/ethers";

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
  fromBlock?: number;
  toBlock?: number;
  blockLimit?: number;
}

/**
 * syncPublicationsByRange fetches filtered logs based on the provided filter, in the range specified.
 *
 * @param rangeParams - BlockRangeOptions
 *    - filter is an ethers EventFilter. It is required.
 *    - toBlock is a number. It is optional and must be :gt;0.  It defaults to the current block height.
 *    - fromBlock is a number, is optional.  If it is not provided, it defaults to 0.
 *    - blockLimit is a number. It is optional and must be :gt;0.  If provided the most blocks fetched will be 0.
 *      If not provided, all blocks matching the other parameters will be returned.
 * @param opts - ConfigOpts
 */
export const syncPublicationsByRange = async (
  rangeParams: BlockRangeOptions,
  opts?: ConfigOpts
): Promise<Array<Publication>> => {
  const provider = requireGetProvider(opts);

  let toBlock = rangeParams.toBlock;
  if (!toBlock) {
    toBlock = await provider.getBlockNumber();
  }

  const fromBlock = rangeParams.fromBlock ? rangeParams.fromBlock : 0;
  // if (rangeParams.blockLimit) {
  //
  // }

  const logs: ethers.providers.Log[] = await provider.getLogs({
    topics: dsnpBatchFilter(2).topics,
    fromBlock: fromBlock,
    toBlock: toBlock,
  });
  const decodedValues = decodeLogsForBatchPublication(logs);
  return decodedValues;
};
