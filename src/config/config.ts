import { ethers } from "ethers";

import MemoryQueue from "../queue/memoryQueue";
import { QueueInterface } from "../queue/queue";
import { StorageInterface } from "../storage/storage";
import { HexString } from "../types/Strings";

export interface Config {
  provider?: ethers.providers.Provider;
  signer?: ethers.Signer;
  queue: QueueInterface;
  store?: StorageInterface;
  contracts: {
    announcer?: HexString;
    beacon?: HexString;
    beaconFactory?: HexString;
    identityLogic?: HexString;
    identityBeaconProxy?: HexString;
    identityCloneFactory?: HexString;
    registry?: HexString;
  };
}

let config: Config = {
  contracts: {},
  queue: new MemoryQueue(),
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
  config = { ...config, ...newConfig };
};
