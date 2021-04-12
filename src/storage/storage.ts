import { ActivityPub } from "../activityPub/activityPub";
import { BatchFileObject } from "../batch/batch";
// import * as config from "../config/config";
import { Config } from "../config/config";
import { NotImplementedError } from "../utilities/errors";

export type File = BatchFileObject | ActivityPub;

export interface StorageInterface {
  store(file: File): Promise<string>;
  fetch(uri: string): Promise<File>;
}

/**
 * store() takes a batch file to store with the chosen hosting solution and
 * returns the URI of the file once stored. This method is not yet implemented.
 *
 * @param   file  The file object to store on the chosen hosting solution
 * @param   opts  Any optional overrides for the default configuration settings
 * @returns       The URI of the hosted file
 */
export const store = async (_file: File, _opts?: Config): Promise<string> => {
  throw NotImplementedError;

  // const config = getConfig(opts);
  // return await config.store.store(file);
};

/**
 * fetch() takes a URI and fetches a batch file from the given address. This
 * method is not yet implemented.
 *
 * @param   uri   The URI of the batch file to download
 * @param   opts  Any optional overrides for the default configuration settings
 * @returns       The batch file fetched from the given URI
 *
 * @throws HTTPError
 * Indicates an error was thrown at the HTTP layer. This may indicate that the
 * host has censored the content for legal reasons if the error code is 451.
 */
export const fetch = async (_uri: string, _opts?: Config): Promise<File> => {
  throw NotImplementedError;

  // const config = getConfig(opts);
  // return await config.storage.fetch(uri);
};