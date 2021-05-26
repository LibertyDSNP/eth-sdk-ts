import { Config, getConfig } from "../config/config";
import { MissingStore } from "../utilities/errors";

export type File = Buffer | string;
export type Content = string | Buffer;

export interface StorageInterface {
  put(targetPath: string, content: Content): Promise<URL>;
  get(targetPath: string): Promise<File>;
}

/**
 * put() takes a batch file to store with the chosen hosting solution and
 * returns the URI of the file once stored.
 *
 * @param   targetPath  The location where the file is stored
 * @param   content The file object to store on the chosen hosting solution
 * @param   opts  Any optional overrides for the default configuration settings
 * @returns       The URI of the hosted file
 */
export const put = async (targetPath: string, content: Content, opts?: Config): Promise<URL> => {
  const { store } = await getConfig(opts);
  if (!store) throw MissingStore;

  return await store.put(targetPath, content);
};

/**
 * get() takes a URI and fetches a batch file from the given address. This
 * method is not yet implemented.
 *
 * @param   targetPath  The URI of the batch file to download
 * @returns       The batch file fetched from the given URI
 *
 * @throws HTTPError
 * Indicates an error was thrown at the HTTP layer. This may indicate that the
 * host has censored the content for legal reasons if the error code is 451.
 */
export const get = async (targetPath: string, opts?: Config): Promise<File> => {
  const { store } = getConfig(opts);
  if (!store) throw MissingStore;

  return await store.get(targetPath);
};
