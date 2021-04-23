// import Web3 from "web3";
import MemoryStore from "../storage/memoryStorage";
import MemoryQueue from "../batch/memoryQueue";

import { StorageInterface } from "../storage/storage";
import { QueueInterface } from "../batch/queue";

export interface Config {
  // blockchain: ChainInterface;
  store: StorageInterface;
  queue: QueueInterface;
}

let config = {
  // blockchain: new Web3.providers.HttpProvider(RPC_URL),
  store: MemoryStore(),
  queue: MemoryQueue(),
};

/**
 * getConfig() fetches the current configuration settings and returns them. This
 * method is not yet implemented.
 *
 * @returns The current configuration settings
 */
export const getConfig = (overrides?: Config): Config => {
  if (!overrides) return config;
  return { ...config, ...overrides };
};

/**
 * setConfig() sets the current configuration with the given object. This method
 * is not yet implemented.
 *
 * @params obj  The configuration settings to set with
 */
export const setConfig = (obj: Config): void => {
  config = obj;
};
