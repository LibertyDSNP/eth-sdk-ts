import { getConfig, Config } from "../config/config";
import { MissingStoreError, NotImplementedError } from "../utilities/errors";

export type File = Buffer | string;
export type Content = string | Buffer;

/**
 * StorageInterface is the interface a storage adapter is expected to implement to
 * be used with high-level methods in this SDK. The require methods consist of
 * an put function, a dequeue function and a get function.
 */
export interface StorageInterface {
  put: (targetPath: string, content: Content) => Promise<URL>;
  get?: (targetPath: string) => Promise<File>;
}

/**
 * put() takes a batch file to store with the chosen hosting solution and
 * returns the URL of the file once stored.
 *
 * @param   targetPath  The path to and name of file.
 * @param   content The file object to store on the chosen hosting solution
 * @returns       The URI of the hosted file
 */
export const put = async (targetPath: string, content: Content, config?: Config): Promise<URL> => {
  const { store } = getConfig(config);
  if (!store) throw MissingStoreError;

  return await store.put(targetPath, content);
};

/**
 * get() fetches a batch file from the given target path.
 *
 * @param   targetPath  The path to and name of file.
 * @returns   The batch file fetched from the given URI
 */
export const get = async (targetPath: string, config?: Config): Promise<File> => {
  const { store } = getConfig(config);
  if (!store) throw MissingStoreError;
  if (!store.get) throw NotImplementedError;

  return await store.get(targetPath);
};
