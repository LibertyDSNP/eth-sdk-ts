import { NotImplementedError } from "../utilities/errors";

interface Config {}

/**
 * getConfig() fetches the current configuration settings and returns them
 *
 * @returns The current configuration settings
 */
export const getConfig = (): Config => {
  throw NotImplementedError();
};

/**
 * setConfig() sets the current configuration with the given object
 *
 * @params obj  The configuration settings to set with
 */
export const setConfig = (obj: Config) => {
  throw NotImplementedError();
};
