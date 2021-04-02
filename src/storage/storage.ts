import { Config } from "../config";

export type StoreFunction = async (file: BatchFileObject): string;

/**
 * store() takes a batch file to store with the chosen hosting solution and
 * returns the URI of the file once stored. This method is not yet implemented.
 *
 * @param   file  The file object to store on the chosen hosting solution
 * @param   opts  Any optional overrides for the default configuration settings
 * @returns       The URI of the hosted file
 */
export const store = async (file: BatchFileObject, opts?: Config): string => {
  throw NotImplementedError();
};

export type FetchFunction = async (uri: string): BatchFileObject;

/**
 * fetch() takes a URI and fetches a batch file from the given address. This
 * method is not yet implemented.
 *
 * @param   uri   The URI of the batch file to download
 * @param   opts  Any optional overrides for the default configuration settings
 * @returns       The batch file fetched from the given URI
 */
export const fetch = async (uri: string, opts?: Config): BatchFileObject => {
  throw NotImplementedError();
};
