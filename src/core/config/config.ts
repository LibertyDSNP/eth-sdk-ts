import { ethers } from "ethers";

import {
  MissingSignerConfigError,
  MissingProviderConfigError,
  MissingStoreConfigError,
  MissingFromIdConfigError,
} from "./errors";
import { StoreInterface } from "../store";
import { HexString } from "../../types/Strings";

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
  /** currentFromURI stores the id of the currently authenticated user */
  currentFromURI?: HexString;
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
 * @returns The current configuration settings with ConfigOpts as overrides.
 */
export const getConfig = (): Config => config;

/**
 * setConfig() sets the current configuration with the given object.
 *
 * @param newConfig - The configuration settings to set with
 */
export const setConfig = (newConfig: Config): void => {
  config = newConfig;
};

/**
 * Get the provider and if undefined, throw.
 *
 * @throws {@link MissingProviderConfigError}
 * Thrown if the provider is not configured.
 * @param opts - overrides for the current configuration.
 * @returns a never-undefined provider
 */
export const requireGetProvider = (opts?: ConfigOpts): ethers.providers.Provider => {
  const provider = opts?.provider || getConfig().provider;
  if (!provider) throw new MissingProviderConfigError();
  return provider;
};

/**
 * Get the signer and if undefined, throw.
 *
 * @throws {@link MissingSignerConfigError}
 * Thrown if the signer is not configured.
 * @param opts - overrides for the current configuration.
 * @returns a never-undefined signer
 */
export const requireGetSigner = (opts?: ConfigOpts): ethers.Signer => {
  const signer = opts?.signer || getConfig().signer;
  if (!signer) throw new MissingSignerConfigError();
  return signer;
};

/**
 * Get the store and if undefined, throw.
 *
 * @throws {@link MissingStoreConfigError}
 * Thrown if the store is not configured.
 * @param opts - overrides for the current configuration.
 * @returns a never-undefined store
 */
export const requireGetStore = (opts?: ConfigOpts): StoreInterface => {
  const store = opts?.store || getConfig().store;
  if (!store) throw new MissingStoreConfigError();
  return store;
};

/**
 * Get the currentFromURI and if undefined, throw.
 *
 * @throws {@link MissingFromIdConfigError}
 * Thrown if the currentFromURI is not configured.
 * @param opts - overrides for the current configuration.
 * @returns a never-undefined currentFromURI
 */
export const requireGetCurrentFromURI = (opts?: ConfigOpts): HexString => {
  const currentFromURI = opts?.currentFromURI || getConfig().currentFromURI;
  if (!currentFromURI) throw new MissingFromIdConfigError();
  return currentFromURI;
};

/**
 * Get the contracts
 *
 * @param opts - overrides for the current configuration.
 * @returns potentially undefined contract addresses
 */
export const getContracts = (opts?: ConfigOpts): Contracts => ({ ...getConfig().contracts, ...opts?.contracts });
