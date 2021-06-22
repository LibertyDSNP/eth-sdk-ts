import { Handle } from "./core/contracts/registry";
import { DSNPType } from "./core/messages/messages";
import { HexString } from "./types/Strings";
import { NotImplementedError } from "./core/utilities/errors";

type BlockNumber = number;

export interface BaseFilters {
  // The type of events to fetch, i.e. "notes", "follows" etc.}
  types: string[];
  // List of user handles to fetch events from. If not present, all users not listed in excludeHandles will be included.
  includeHandles?: Handle[];
  // List of user handles to exclude from results, such as a blocklist.
  excludeHandles?: Handle[];
  // List of hashes to seek replies to. For use in fetching comments and reactions.
  inReplyTo?: HexString[];
}

export interface FetchFilters extends BaseFilters {
  // The maximum number of results to fetch.
  limit?: number;
  // The last block to scan for events. Defaults to current block.
  to?: BlockNumber;
  // The first block to scan for events. Defaults to genesis.
  from?: BlockNumber;
}

type SubscriptionCallbackFn = (event: DSNPType) => void;
type SubscriptionId = string;

/**
 * subscribe() takes a callback to invoke upon receiving new activity pub events
 * matching the given criteria. This method only works if the web3 provider set
 * in the configuration is a websocket provider. This method is not yet
 * implemented.
 *
 * @param _filters - Any filter options for including or excluding certain events
 * @param _callback - The callback function to be called when an event is received
 * @returns A subscription id to unsubscribe later if needed
 */
export const subscribe = (_filters: BaseFilters, _callback: SubscriptionCallbackFn): SubscriptionId => {
  throw NotImplementedError;
};

/**
 * unsubscribe() removes a subscription callback created with the subscribe
 * method. This method only works if the web3 provider set in the configuration
 * is a websocket provider. This method is not yet implemented.
 *
 * @param _id - The ID of the subscription to close
 */
export const unsubscribe = (_id: SubscriptionId): void => {
  throw NotImplementedError;
};

/**
 * fetchEvents() fetches the most recent activity pub events matching the given
 * search criteria. This method is not yet implemented.
 *
 * @param _filters - Any filter options for including or excluding certain events
 * @returns An array of events
 */
export const fetchEvents = async (_filters: FetchFilters): Promise<DSNPType[]> => {
  throw NotImplementedError;
};
