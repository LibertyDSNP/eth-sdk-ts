import { ActivityPub } from "../activityPub/activityPub";
import { NotImplementedError } from "../utilities/errors";

export interface BatchFileObject {}

/**
 * create() takes a series of activity pub objects and returns a Batch file
 * object for publishing. This method is not yet implemented.
 *
 * @params  activityPubs  An array of activityPubs to include in the batch file
 * @returns               A batch file object
 */
export const create = (activityPubs: ActivityPub[]): BatchFileObject => {
  throw NotImplementedError();
};
