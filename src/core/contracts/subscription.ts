import { HexString } from "../../types/Strings";
import { ethers } from "ethers";
import { requireGetProvider } from "../../config";
import { dsnpBatchFilter } from "./announcement";
import { Filter } from "@ethersproject/abstract-provider";
import { Announcer__factory } from "../../types/typechain";
const ANNOUNCER_DECODER = new ethers.utils.Interface(Announcer__factory.abi);

/**
 * BatchAnnounceCallbackArgs: interface for callback function that is passed to subscribeToBatchAnnounceEvents
 */
export interface BatchAnnounceCallbackArgs {
  blockNumber: number;
  transactionHash: HexString;
  dsnpType: number;
  dsnpUri: string;
  dsnpHash: HexString;
}

interface ParsedLog {
  fragment: ethers.utils.LogDescription;
  log: ethers.providers.Log;
}

export interface BatchFilterOptions {
  dsnpType?: number;
  fromBlock?: number;
}
type BatchAnnounceCallback = (doReceiveAnnouncement: BatchAnnounceCallbackArgs) => void;

/**
 * subscribeToBatchAnnounceEvents() sets up a listener to listen to retrieve Batch Announce events from the chain.
 * It takes a callback and a filter. The filter is used to filter events that come through.
 * The callback is invoked for each correctly filtered event.
 *
 * @param doReceiveAnnouncement - The callback function to be called when an event is received
 * @param filter - Any filter options for including or excluding certain events
 * @returns A function that can be called to remove listener for this type of event
 */
export const subscribeToBatchAnnounceEvents = async (
  doReceiveAnnouncement: BatchAnnounceCallback,
  filter?: BatchFilterOptions
): Promise<() => void> => {
  let pastLogs: BatchAnnounceCallbackArgs[] = [];
  const currentLogQueue: BatchAnnounceCallbackArgs[] = [];
  const batchFilter: ethers.EventFilter = await dsnpBatchFilter();
  const batchFilterWithOptions = filter ? createFilter(batchFilter, filter) : batchFilter;

  const provider = requireGetProvider();
  let maxBlockNumberForPastLogs = filter?.fromBlock || 0;
  let useQueue = filter?.fromBlock != undefined;

  provider.on(batchFilterWithOptions, (log: ethers.providers.Log) => {
    const logItem = decodeLogsForBatchAnnounce([log])[0];

    if (useQueue) {
      currentLogQueue.push(logItem);
    } else if (logItem.blockNumber > maxBlockNumberForPastLogs) {
      doReceiveAnnouncement(logItem);
    }
  });

  if (useQueue) {
    pastLogs = await getPastLogs(provider, { fromBlock: filter?.fromBlock });
    maxBlockNumberForPastLogs = pastLogs[pastLogs.length - 1].blockNumber;

    while (pastLogs.length > 0) {
      const batchItem = pastLogs.shift();
      if (batchItem) doReceiveAnnouncement(batchItem);
    }

    while (currentLogQueue.length > 0) {
      const batchItem = currentLogQueue.shift();
      if (batchItem && batchItem.blockNumber > maxBlockNumberForPastLogs) doReceiveAnnouncement(batchItem);
    }

    useQueue = false;
  }

  return () => {
    provider.off(batchFilterWithOptions);
  };
};

const createFilter = (batchFilter: ethers.EventFilter, filterOptions: BatchFilterOptions) => {
  const topics = batchFilter.topics ? batchFilter.topics : [];
  const dsnpTypeTopic = filterOptions?.dsnpType ? "0x" + filterOptions.dsnpType.toString(16).padStart(64, "0") : null;
  if (dsnpTypeTopic) {
    topics.push(dsnpTypeTopic);
  }

  const finalFilter: ethers.providers.EventType = {
    topics: topics,
  };
  return finalFilter;
};

const getPastLogs = async (
  provider: ethers.providers.Provider,
  filter: Filter
): Promise<BatchAnnounceCallbackArgs[]> => {
  const logs = await provider.getLogs(filter);
  return decodeLogsForBatchAnnounce(logs);
};

const decodeLogsForBatchAnnounce = (logs: ethers.providers.Log[]): BatchAnnounceCallbackArgs[] => {
  return logs
    .map((log: ethers.providers.Log) => {
      const fragment = ANNOUNCER_DECODER.parseLog(log);
      return { fragment, log: log };
    })
    .filter((desc: ParsedLog) => desc.fragment.name === "DSNPBatch")
    .map((item: ParsedLog) => {
      return {
        dsnpType: item.fragment.args.dsnpType,
        dsnpHash: item.fragment.args.dsnpHash,
        dsnpUri: item.fragment.args.dsnpUri,
        blockNumber: item.log.blockNumber,
        transactionHash: item.log.transactionHash,
      };
    });
};
