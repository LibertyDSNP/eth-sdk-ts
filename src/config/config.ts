// import Web3 from "web3";
// import MemoryStore from "../storage/memoryStorage";
// import MemoryQueue from "../batch/memoryQueue";

import { StoreInterface } from "../storage/storage";
import { QueueInterface } from "../batch/queue";
import { NotImplementedError } from "../utilities/errors";

interface Config {
  blockchain: BlockchainProvider;
  store: StoreInterface;
  queue: QueueInterface;
}

// let config = {
//   blockchain: new Web3.providers.HttpProvider(RPC_URL),
//   storage: new MemoryStore(),
//   queue: new MemoryQueue(),
// };

/**
 * getConfig() fetches the current configuration settings and returns them. This
 * method is not yet implemented.
 *
 * @returns The current configuration settings
 */
export const getConfig = (overrides?: Config): Config => {
  throw NotImplementedError();

  // if (!overrides) return config;
  // return { ...overrides, ...config };
};

/**
 * setConfig() sets the current configuration with the given object. This method
 * is not yet implemented.
 *
 * @params obj  The configuration settings to set with
 */
export const setConfig = (obj: Config) => {
  throw NotImplementedError();

  // config = obj;
};
