// import * as activityPub from "../activityPub/activityPub";
// import * as config from "../config/config";
// import * as storage from "../storage/storage";
import { ActivityPubCreateOpts } from "../activityPub/activityPub";
import { Config } from "../config/config";
import { Handle } from "./handles";
import { DSNPMessage } from "../types/DSNP";
import { KeccakHash } from "../utilities/hash";

/**
 * broadcast() creates a broadcast DSNP event and enqueues it for the next
 * batch. This method is not yet implemented.
 *
 * @param activityPubOpts  Any options for the activity pub event to create
 * @param opts             Optional. Configuration overrides, such as from address, if any
 *
 */
export const broadcast = async (activityPubOpts: ActivityPubCreateOpts, opts?: Config) => {
  throw NotImplementedError();

  // const config = config.getConfig(opts);
  //
  // const activityPubObject = activityPub.create(activityPubOpts);
  // const activityPubHash = activityPub.hash(activityPubObject);
  // const uri = storage.store(activityPubObject, opts);
  //
  // const event = events.createBroadcastEvent(uri, activityPubHash);
  // config.batchEnqueueMethod(event, opts);
};

/**
 * reply() creates a reply activity pub event and enqueues it for the next
 * batch. This method is not yet implemented.
 *
 * @param activityPubOpts  Any options for the activity pub event to create
 * @param opts             Optional. Configuration overrides, such as from address, if any
 */
export const reply = async (activityPubOpts: ActivityPubCreateOpts, opts: Config) => {
  throw NotImplementedError();

  // const config = config.getConfig(opts);
  //
  // const inReplyTo = activityPubOpts.inReplyTo;
  // const activityPubObject = activityPub.create(activityPubOpts);
  // const activityPubHash = activityPub.hash(activityPubObject);
  // const uri = storage.store(activityPubObject, opts);
  //
  // const event = events.createReplyEvent(uri, inReplyTo, activityPubHash);
  // config.batchEnqueueMethod(event, opts);
};

/**
 * react() creates a reaction activity pub event and enqueues it for the next
 * batch. This method is not yet implemented.
 *
 * @param activityPubOpts  Any options for the activity pub event to create
 * @param opts             Optional. Configuration overrides, such as from address, if any
 */
export const react = async (activityPubOpts: ActivityPubCreateOpts, opts: Config) => {
  throw NotImplementedError();

  // const config = config.getConfig(opts);
  //
  // const inReplyTo = activityPubOpts.inReplyTo;
  // const activityPubObject = activityPub.create(activityPubOpts);
  // const activityPubHash = activityPub.hash(activityPubObject);
  // const uri = storage.store(activityPubObject, opts);
  //
  // const event = events.createReactionEvent(uri, inReplyTo, activityPubHash);
  // config.batchEnqueueMethod(event, opts);
};

/**
 * @typedef EventFilters
 * @property {string[]} types          The type of events to fetch, i.e. "notes", "follows" etc.
 * @property {Handle[]} includeHandles List of user handles to fetch events from. If not present, all users not listed in excludeHandles will be included.
 * @property {Handle[]} excludeHandles List of user handles to exclude from results, such as a blocklist.
 * @property {KeccakHash[]} inReplyTo  List of hashes to seek replies to. For use in fetching comments and reactions.
 * @property {string} limit            The maximum number of results to fetch.
 * @property {BlockNumber} to          The last block to scan for events. Defaults to current block.
 * @property {BlockNumber} from        The first block to scan for events. Defaults to genesis.
 */
interface EventFilters {
  types: string[];
  includeHandles?: Handle[];
  excludeHandles?: Handle[];
  inReplyTo?: KeccakHash[];
  limit?: number;
  to?: BlockNumber;
  from?: BlockNumber;
}

/**
 * fetchEvents() fetches the most recent activity pub events matching the given
 * search criteria. This method is not yet implemented.
 *
 * @param filters  Any filter options for including or excluding certain events
 * @param opts     Optional. Configuration overrides, such as from address, if any
 * @returns        An array of events
 */
export const fetchEvents = async (filters: EventFilters): DSNPMessage[] => {
  throw NotImplementedError();
};
