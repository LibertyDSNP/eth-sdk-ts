import { MessageType } from "../types/DSNP";
import { NotImplementedError } from "../utilities";

export type BatchFileObject = string;

/**
 * createFile() takes a series of activity pub objects and returns a Batch file
 * object for publishing. This method is not yet implemented.
 *
 * @params  events  An array of DSNPEvents to include in the batch file
 * @returns         A batch file object
 */
export const createFile = (_events: MessageType[]): BatchFileObject => {
  throw NotImplementedError;
};

/**
 * openFile() takes a Batch file object . This method is not yet implemented.
 *
 * @params  file  A batch file object to open
 * @returns       An array of DSNPEvents from the batch file
 */
export const openFile = (_file: BatchFileObject): MessageType[] => {
  throw NotImplementedError;
};
