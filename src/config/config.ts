import * as fs from "fs";
import * as path from "path";
import Web3 from "web3";

import MemoryQueue from "../batch/memoryQueue";
import { QueueInterface } from "../batch/queue";
import MemoryStore from "../storage/memoryStorage";
import { StorageInterface } from "../storage/storage";
import { EthereumAddress } from "../types/Strings";

const CONFIG_FILE_PATH = "./dsnp.config.js";

export interface Config {
  accountAddress?: EthereumAddress;
  provider?: Web3;
  queue: QueueInterface;
  store: StorageInterface;
}

let config: Config = {
  queue: MemoryQueue(),
  store: MemoryStore(),
};

let isConfigLoaded = false;
const loadConfigFile = async (): Promise<void> => {
  if (isConfigLoaded) return;

  const filePath = path.resolve(CONFIG_FILE_PATH);
  if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) return;

  // Load the config file from disk
  config = await import(filePath);

  // And set the flag to skip loading in the future
  isConfigLoaded = true;
};

/**
 * getConfig() fetches the current configuration settings and returns them. This
 * method is not yet implemented.
 *
 * @returns The current configuration settings
 */
export const getConfig = async (overrides?: Config): Promise<Config> => {
  // Load the config file from disk, if any
  await loadConfigFile();

  // Return the config, if there are no overrides to apply
  if (!overrides) return config;

  // Otherwise, return the config with overrides
  return { ...config, ...overrides };
};

/**
 * setConfig() sets the current configuration with the given object. This method
 * is not yet implemented.
 *
 * @params newConfig The configuration settings to set with
 */
export const setConfig = async (newConfig: Config): Promise<void> => {
  // Set the config settings
  config = newConfig;

  // Don't bother loading the config file in the future
  isConfigLoaded = true;
};
