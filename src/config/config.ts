import { ethers } from "ethers";

import MemoryQueue from "../batch/memoryQueue";
import { QueueInterface } from "../batch/queue";
import MemoryStore from "../storage/memoryStorage";
import { StorageInterface } from "../storage/storage";

export interface Config {
  provider?: ethers.providers.Provider;
  signer?: ethers.Signer;
  queue: QueueInterface;
  store: StorageInterface;
}

let config: Config = {
  queue: MemoryQueue(),
  store: MemoryStore(),
};

/**
 * getConfig() fetches the current configuration settings and returns them. This
 * method is not yet implemented.
 *
 * @returns The current configuration settings
 */
export const getConfig = async (overrides?: Config): Promise<Config> => {
  if (!overrides) return config;

  return { ...config, ...overrides };
};

/**
 * setConfig() sets the current configuration with the given object. This method
 * is not yet implemented.
 *
 * @params newConfig The configuration settings to set with
 */
export const setConfig = async (newConfig: Config): Promise<void> => {
  config = newConfig;
};
