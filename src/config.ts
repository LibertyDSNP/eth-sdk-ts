import { ethers } from "ethers";

import MemoryQueue from "./core/queue/memoryQueue";
import { QueueInterface } from "./core/queue";
import { StoreInterface } from "./core/store";
import { HexString } from "./types/Strings";

export const MissingContract = new Error("Contract was not found");
export const MissingSigner = new Error("Signer is not set.");
export const MissingProvider = new Error("Blockchain provider is not set.");
export const MissingStore = new Error("Store adapter was not found");
export const MissingUser = new Error("No user id found. Please authenticate a handle.");

export interface Contracts {
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
}

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
  store?: StoreInterface;
  /** Contracts are different addresses for specific contracts or for running custom tests */
  contracts: Contracts;
  /** currentFromId stores the id of the currently authenticated user */
  currentFromId?: string;
  /** to allow access of keys by name */
  [index: string]: unknown;
}

/**
 * ConfigOpts represents override options to be passed when fetching the config
 */
export type ConfigOpts = Partial<Config>;

let config: Config = {
  contracts: {},
  queue: new MemoryQueue(),
};

/**
 * getConfig() fetches the current configuration settings and returns them.
 *
 * @returns The current configuration settings with ConfigOpts as overrides.
 */
export const getConfig = (overrides?: ConfigOpts): Config => {
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
 * @param newConfig - The configuration settings to set with
 * @returns The newly constructed config
 */
export const setConfig = (newConfig: ConfigOpts): Config => {
  const { signer, provider } = newConfig;
  if (provider && signer && !signer.provider) newConfig.signer = signer.connect(provider);
  return (config = {
    // Defaults
    queue: new MemoryQueue(),
    contracts: {},
    ...newConfig,
  });
};

/**
 * Get the provider and if undefined, throw.
 * @param opts - overrides for the current configuration.
 * @returns a never-undefined provider
 */
export const requireGetProvider = (opts?: ConfigOpts): ethers.providers.Provider => {
  const c = getConfig(opts);
  if (!c.provider) throw MissingProvider;
  return c.provider;
};

/**
 * Get the signer and if undefined, throw.
 * @param opts - overrides for the current configuration.
 * @returns a never-undefined signer
 */
export const requireGetSigner = (opts?: ConfigOpts): ethers.Signer => {
  const c = getConfig(opts);
  if (!c.signer) throw MissingSigner;
  return c.signer;
};

/**
 * Get the store and if undefined, throw.
 * @param opts - overrides for the current configuration.
 * @returns a never-undefined store
 */
export const requireGetStore = (opts?: ConfigOpts): StoreInterface => {
  const c = getConfig(opts);
  if (!c.store) throw MissingStore;
  return c.store;
};

/**
 * Get the currentFromId and if undefined, throw.
 * @param opts - overrides for the current configuration.
 * @returns a never-undefined currentFromId
 */
export const requireGetCurrentFromId = (opts?: ConfigOpts): string => {
  const c = getConfig(opts);
  if (!c.currentFromId) throw MissingUser;
  return c.currentFromId;
};

/**
 * Get the queue.  Since this is a required field, this is a plain getter.
 * @param opts - overrides for the current configuration.
 */
export const getQueue = (opts?: ConfigOpts): QueueInterface => {
  const c = getConfig(opts);
  return c.queue;
};

/**
 * Get the contracts.  Since this is a required field, this is a plain getter.
 * @param opts - overrides for the current configuration.
 */
export const getContracts = (opts?: ConfigOpts): Contracts => {
  const c = getConfig(opts);
  return c.contracts;
};
