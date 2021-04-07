import { DSNPMessage } from "../types/DSNP";
import { NotImplementedError } from "../utilities/errors";

export interface BatchFileObject {}

/**
 * createFile() takes a series of activity pub objects and returns a Batch file
 * object for publishing. This method is not yet implemented.
 *
 * @params  events  An array of DSNPEvent to include in the batch file
 * @returns         A batch file object
 */
export const createFile = (events: DSNPMessage[]): BatchFileObject => {
  throw NotImplementedError();
};

/**
 * openFile() takes a Batch file object . This method is not yet implemented.
 *
 * @params  file  An array of DSNPEvent to include in the batch file
 * @returns       A batch file object
 */
export const openFile = (file: BatchFileObject): DSNPMessage[] => {
  throw NotImplementedError();
};
