import { HexString } from "../../types/Strings";
import { ethers } from "ethers";
import { requireGetProvider } from "../config";
import { dsnpBatchFilter } from "./publisher";
import { Filter } from "@ethersproject/abstract-provider";
import { Publisher__factory } from "../../types/typechain";
import { LogDescription } from "@ethersproject/abi";
const PUBLISHER_DECODER = new ethers.utils.Interface(Publisher__factory.abi);

/**
 * subscribeToBatchPublications: interface for callback function that is passed
 * to subscribeToBatchPublications
 */
export interface BatchPublicationCallbackArgs {
  blockNumber: number;
  transactionHash: HexString;
  announcementType: number;
  fileUrl: string;
  fileHash: HexString;
}

/**
 * ParsedLog: interface for parsing log data
 */
export interface ParsedLog {
  fragment: ethers.utils.LogDescription;
  log: ethers.providers.Log;
}

export interface BatchFilterOptions {
  announcementType?: number;
  fromBlock?: number;
}
type BatchPublicationCallback = (doReceivePublication: BatchPublicationCallbackArgs) => void;

/**
 * subscribeToBatchPublications() sets up a listener to listen to retrieve Batch
 * Publication events from the chain. It takes a callback and a filter. The
 * filter is used to filter events that come through. The callback is invoked
 * for each correctly filtered event.
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @param doReceivePublication - The callback function to be called when an event is received
 * @param filter - Any filter options for including or excluding certain events
 * @returns A function that can be called to remove listener for this type of event
 */
export const subscribeToBatchPublications = async (
  doReceivePublication: BatchPublicationCallback,
  filter?: BatchFilterOptions
): Promise<() => void> => {
  let pastLogs: BatchPublicationCallbackArgs[] = [];
  const currentLogQueue: BatchPublicationCallbackArgs[] = [];
  const batchFilter: ethers.EventFilter = await dsnpBatchFilter();
  const batchFilterWithOptions = filter ? createFilter(batchFilter, filter) : batchFilter;

  const provider = requireGetProvider();
  let maxBlockNumberForPastLogs = filter?.fromBlock || 0;
  let useQueue = filter?.fromBlock != undefined;

  provider.on(batchFilterWithOptions, (log: ethers.providers.Log) => {
    const logItem = decodeLogsForBatchPublication([log])[0];

    if (useQueue) {
      currentLogQueue.push(logItem);
    } else if (logItem.blockNumber > maxBlockNumberForPastLogs) {
      doReceivePublication(logItem);
    }
  });

  if (useQueue) {
    pastLogs = await getPastLogs(provider, { ...batchFilter, fromBlock: filter?.fromBlock });

    if (pastLogs.length) {
      maxBlockNumberForPastLogs = pastLogs[pastLogs.length - 1].blockNumber;

      while (pastLogs.length > 0) {
        const batchItem = pastLogs.shift();
        if (batchItem) doReceivePublication(batchItem);
      }

      while (currentLogQueue.length > 0) {
        const batchItem = currentLogQueue.shift();
        if (batchItem && batchItem.blockNumber > maxBlockNumberForPastLogs) doReceivePublication(batchItem);
      }
    }
    useQueue = false;
  }

  return () => {
    provider.off(batchFilterWithOptions);
  };
};

const createFilter = (batchFilter: ethers.EventFilter, filterOptions: BatchFilterOptions) => {
  const topics = batchFilter.topics ? batchFilter.topics : [];
  const announcementTypeTopic = filterOptions?.announcementType
    ? "0x" + filterOptions.announcementType.toString(16).padStart(64, "0")
    : null;
  if (announcementTypeTopic) {
    topics.push(announcementTypeTopic);
  }

  const finalFilter: ethers.providers.EventType = {
    topics: topics,
  };
  return finalFilter;
};

const getPastLogs = async (
  provider: ethers.providers.Provider,
  filter: Filter
): Promise<BatchPublicationCallbackArgs[]> => {
  const logs = await provider.getLogs(filter);
  return decodeLogsForBatchPublication(logs);
};

const decodeLogsForBatchPublication = (logs: ethers.providers.Log[]): BatchPublicationCallbackArgs[] => {
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
      };
    });
};
