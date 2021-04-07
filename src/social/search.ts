import { BaseFilters } from "./content";
import { DSNPMessage } from "../types/DSNP";
import { KeccakHash } from "../utilities/hash";

type BlockNumber = number;

/**
 * @typedef BaseFilters
 * @property {string[]} types          The type of events to fetch, i.e. "notes", "follows" etc.
 * @property {Handle[]} includeHandles List of user handles to fetch events from. If not present, all users not listed in excludeHandles will be included.
 * @property {Handle[]} excludeHandles List of user handles to exclude from results, such as a blocklist.
 * @property {KeccakHash[]} inReplyTo  List of hashes to seek replies to. For use in fetching comments and reactions.
 */
export interface BaseFilters {
  types: string[];
  includeHandles?: Handle[];
  excludeHandles?: Handle[];
  inReplyTo?: KeccakHash[];
}

/**
 * @typedef FetchFilters
 * @property {string} limit            The maximum number of results to fetch.
 * @property {BlockNumber} to          The last block to scan for events. Defaults to current block.
 * @property {BlockNumber} from        The first block to scan for events. Defaults to genesis.
 */
interface FetchFilters extends BaseFilters {
  limit?: number;
  to?: BlockNumber;
  from?: BlockNumber;
}

type SubscriptionCallbackFn = (event: Event): void;
type SubscriptionId = string;

/**
 * subscribe() takes a callback to invoke upon receiving new activity pub events
 * matching the given criteria. This method only works if the web3 provider set
 * in the configuration is a websocket provider. This method is not yet
 * implemented.
 *
 * @param filters  Any filter options for including or excluding certain events
 * @param callback The callback function to be called when an event is receieved
 * @returns        A subscription id to unsubscribe later if needed
 */
export const subscribe = (filters: BaseFilters, callback: SubscriptionCallbackFn): SubscriptionId => {
  throw NotImplementedError();
};

/**
 * unsubscribe() removes a subscription callback created with the subscribe
 * method. This method only works if the web3 provider set in the configuration
 * is a websocket provider. This method is not yet implemented.
 *
 * @param subscriptionId The ID of the subscription to close
 */
export const unsubscribe = (id: SubscriptionId) => {
  throw NotImplementedError();
};

/**
 * fetchEvents() fetches the most recent activity pub events matching the given
 * search criteria. This method is not yet implemented.
 *
 * @param filters Any filter options for including or excluding certain events
 * @param opts    Optional. Configuration overrides, such as from address, if any
 * @returns       An array of events
 */
export const fetchEvents = async (filters: FetchFilters): DSNPMessage[] => {
  throw NotImplementedError();
};
