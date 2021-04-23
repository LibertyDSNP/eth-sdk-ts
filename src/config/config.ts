import * as fs from "fs";
import * as path from "path";

// import Web3 from "web3";
import MemoryStore from "../storage/memoryStorage";
import MemoryQueue from "../batch/memoryQueue";

import { StorageInterface } from "../storage/storage";
import { QueueInterface } from "../batch/queue";

const CONFIG_FILE_PATH = "./dsnp.config.js";

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

let isConfigLoaded = false;
const loadConfigFile = async (): Promise<void> => {
  // If the config file has already been loaded, do nothing
  if (isConfigLoaded) return;

  // If no config file exists, do nothing
  const filePath = path.resolve(CONFIG_FILE_PATH);
  if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) return;

  // Otherwise, load the config file from disk
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
 * @params obj  The configuration settings to set with
 */
export const setConfig = async (obj: Config): Promise<void> => {
  // Set the config settings
  config = obj;

  // Don't bother loading the config file in the future
  isConfigLoaded = true;
};
