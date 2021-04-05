import { StoreFunction, FetchFunction } from "../storage/storage";
import { BatchEnqueueFunction, BatchDequeueFunction } from "../batch/queue";
import { NotImplementedError } from "../utilities/errors";

interface Config {
  storeMethod: StoreFunction;
  fetchMethod: FetchFunction;
  batchEnqueueMethod: BatchEnqueueFunction;
  batchDequeueMethod: BatchDequeueFunction;
}

/**
 * getConfig() fetches the current configuration settings and returns them. This
 * method is not yet implemented.
 *
 * @returns The current configuration settings
 */
export const getConfig = (): Config => {
  throw NotImplementedError();
};

/**
 * setConfig() sets the current configuration with the given object. This method
 * is not yet implemented.
 *
 * @params obj  The configuration settings to set with
 */
export const setConfig = (obj: Config) => {
  throw NotImplementedError();
};
