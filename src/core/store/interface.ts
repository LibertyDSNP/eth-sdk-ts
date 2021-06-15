import { ConfigOpts, requireGetStore } from "../../config";
import { NotImplementedError } from "../utilities/errors";

export type File = Buffer | string;
export type Content = string | Buffer;

/**
 * StoreInterface is the interface a storage adapter is expected to implement to
 * be used with high-level methods in this SDK. The require methods consist of
 * an put function, a dequeue function and a get function.
 */
export interface StoreInterface {
  put: (targetPath: string, content: Content) => Promise<URL>;
  get?: (targetPath: string) => Promise<File>;
}

/**
 * put() takes a batch file to store with the chosen hosting solution and
 * returns the URL of the file once stored.
 *
 * @param targetPath - The path to and name of file.
 * @param content - The file object to store on the chosen hosting solution
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns       The URI of the hosted file
 */
export const put = async (targetPath: string, content: Content, opts?: ConfigOpts): Promise<URL> => {
  const store = requireGetStore(opts);
  return await store.put(targetPath, content);
};

/**
 * get() fetches a batch file from the given target path.
 *
 * @param targetPath - The path to and name of file.
 * @param opts - Optional. Configuration overrides, such as from address, if any
 * @returns   The batch file fetched from the given URI
 */
export const get = async (targetPath: string, opts?: ConfigOpts): Promise<File> => {
  const store = requireGetStore(opts);
  if (!store.get) throw NotImplementedError;

  return await store.get(targetPath);
};
