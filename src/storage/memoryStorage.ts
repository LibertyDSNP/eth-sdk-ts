import { File, StorageInterface } from "./store";
import { NotImplementedError } from "../utilities/errors";

/**
 * store() implements the store function of the StorageInterface. It takes a
 * file object to store and returns a URI for the stored data. This method is
 * not yet implemented.
 *
 * @param file The file to store
 * @returns    The URI of the stored file
 */
export const store = async (file: File): string => {
  throw NotImplementedError();
};

/**
 * fetch() implements the fetch function of the StorageInterface. It takes the
 * URI of a file to fetch and returns the file. This method is not yet
 * implemented.
 *
 * @param uri The URI of the file to fetch
 * @returns   The fetched file
 */
export const fetch = async (uri: string): Promise<File> => {
  throw NotImplementedError();
};

const initializer = (): StorageInterface => {
  return {
    store,
    fetch,
  };
};

export default initializer;
