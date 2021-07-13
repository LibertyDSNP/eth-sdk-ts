import { ethers } from "ethers";

import {
  MissingSignerConfigError,
  MissingProviderConfigError,
  MissingStoreConfigError,
  MissingFromIdConfigError,
} from "./core/config";
import { StoreInterface } from "./core/store";
import { HexString } from "./types/Strings";

/* The name of the Batch Publisher contract */
type PublisherContractName = "Publisher";
/* The name of the Beacon contract */
type BeaconContractName = "Beacon";
/* The name of the Beacon Proxy Factory contract */
type BeaconFactoryContractName = "BeaconFactory";
/* The name of the Identity Logic contract */
type IdentityLogicContractName = "Identity";
/* The name of the Identity Clone Proxy Factory contract */
type IdentityCloneFactoryContractName = "IdentityCloneFactory";
/* The name of the Registry contract */
type RegistryContractName = "Registry";
/** Any valid contract name */
export type ContractName =
  | PublisherContractName
  | BeaconContractName
  | BeaconFactoryContractName
  | IdentityLogicContractName
  | IdentityCloneFactoryContractName
  | RegistryContractName;

type Contracts = { [key in ContractName]?: HexString };

/**
 * The Config Interface provides for various settings and plugable modules.
 */
export interface Config {
  /** An [Ethers.js Provider](https://docs.ethers.io/v5/api/provider/) */
  provider?: ethers.providers.Provider;
  /** An [Ethers.js Signer](https://docs.ethers.io/v5/api/signer/) */
  signer?: ethers.Signer;
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
};

/**
 * getConfig() fetches the current configuration settings and returns them.
 *
 * @param overrides - Config overrides for this request
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
 * setConfig() sets the current configuration with the given object. Any keys
 * previously set on the config object will not be removed. To remove a config
 * option, this method should be called with undefined passed for the given key
 * to override it.
 *
 * @param newConfig - The configuration settings to set with
 * @returns The newly constructed config
 */
export const setConfig = (newConfig: ConfigOpts): Config => {
  const { signer, provider } = newConfig;
  if (provider && signer && !signer.provider) newConfig.signer = signer.connect(provider);
  return (config = {
    ...config,
    ...newConfig,
  });
};

/**
 * Get the provider and if undefined, throw.
 *
 * @param opts - overrides for the current configuration.
 * @returns a never-undefined provider
 */
export const requireGetProvider = (opts?: ConfigOpts): ethers.providers.Provider => {
  const c = getConfig(opts);
  if (!c.provider) throw new MissingProviderConfigError();
  return c.provider;
};

/**
 * Get the signer and if undefined, throw.
 *
 * @param opts - overrides for the current configuration.
 * @returns a never-undefined signer
 */
export const requireGetSigner = (opts?: ConfigOpts): ethers.Signer => {
  const c = getConfig(opts);
  if (!c.signer) throw new MissingSignerConfigError();
  return c.signer;
};

/**
 * Get the store and if undefined, throw.
 *
 * @param opts - overrides for the current configuration.
 * @returns a never-undefined store
 */
export const requireGetStore = (opts?: ConfigOpts): StoreInterface => {
  const c = getConfig(opts);
  if (!c.store) throw new MissingStoreConfigError();
  return c.store;
};

/**
 * Get the currentFromId and if undefined, throw.
 *
 * @param opts - overrides for the current configuration.
 * @returns a never-undefined currentFromId
 */
export const requireGetCurrentFromId = (opts?: ConfigOpts): string => {
  const c = getConfig(opts);
  if (!c.currentFromId) throw new MissingFromIdConfigError();
  return c.currentFromId;
};

/**
 * Get the contracts
 *
 * @param opts - overrides for the current configuration.
 * @returns potentially undefined contract addresses
 */
export const getContracts = (opts?: ConfigOpts): Contracts => {
  const c = getConfig(opts);
  return c.contracts;
};
