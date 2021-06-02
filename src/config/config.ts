import { ethers } from "ethers";

import MemoryQueue from "../queue/memoryQueue";
import { QueueInterface } from "../queue/queue";
import { StorageInterface } from "../storage/storage";
import { HexString } from "../types/Strings";

/**
 * The Config Interface provides for various settings and plugable modules.
 */
export interface Config {
  /** An [Ethers.js Provider](https://docs.ethers.io/v5/api/provider/) */
  provider?: ethers.providers.Provider;
  /** An [Ethers.js Signer](https://docs.ethers.io/v5/api/signer/) */
  signer?: ethers.Signer;
  /** The queue manages Announcements waiting to be batched */
  queue: QueueInterface;
  /** The Storage handles storing batch, content, and other media files at a publicly accessible location */
  store?: StorageInterface;
  /** Contracts are different addresses for specific contracts or for running custom tests */
  contracts: {
    /** The Address of the Batch Announce contract */
    announcer?: HexString;
    /** The Address of the Beacon contract */
    beacon?: HexString;
    /** The Address of the Beacon Proxy Factory contract */
    beaconFactory?: HexString;
    /** The Address of the Identity Logic contract */
    identityLogic?: HexString;
    /** The Address of the Identity Clone Proxy Factory contract */
    identityCloneFactory?: HexString;
    /** The Address of the Registry contract */
    registry?: HexString;
  };
}

let config: Config = {
  contracts: {},
  queue: new MemoryQueue(),
};

/**
 * getConfig() fetches the current configuration settings and returns them.
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
 * setConfig() sets the current configuration with the given object.
 *
 * @params newConfig The configuration settings to set with
 */
export const setConfig = (newConfig: Config): void => {
  config = { ...config, ...newConfig };
};
