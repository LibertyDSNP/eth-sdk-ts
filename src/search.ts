import { Handle } from "./core/contracts/registry";
import { HexString } from "./types/Strings";

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
