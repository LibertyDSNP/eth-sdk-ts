import { ethers } from "ethers";

import MemoryQueue from "../batch/memoryQueue";
import { QueueInterface } from "../batch/queue";
import { StorageInterface } from "../storage/storage";
import { HexString } from "../types/Strings";

export interface Config {
  provider?: ethers.providers.Provider;
  signer?: ethers.Signer;
  queue: QueueInterface;
  store?: StorageInterface;
  contracts: {
    registry?: HexString;
  };
}

let config: Config = {
  queue: MemoryQueue(),
  contracts: {},
};

/**
 * getConfig() fetches the current configuration settings and returns them. This
 * method is not yet implemented.
 *
 * @returns The current configuration settings
 */
export const getConfig = (overrides?: Partial<Config>): Config => {
  if (!overrides) return config;

  return {
    ...config,
    ...overrides,
    contracts: { ...config.contracts, ...overrides.contracts },
  };
};

/**
 * setConfig() sets the current configuration with the given object. This method
 * is not yet implemented.
 *
 * @params newConfig The configuration settings to set with
 */
export const setConfig = (newConfig: Config): void => {
  config = newConfig;
};
