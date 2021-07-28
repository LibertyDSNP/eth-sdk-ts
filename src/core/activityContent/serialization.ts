import { ActivityContentNote, ActivityContentProfile } from "./factories";
import { sortObject } from "../utilities/json";

/**
 * serialize() converts an ActivityContent object to string for upload via the
 * storage adapter.
 *
 * @param data - The activity content object to hash
 * @returns A string representation of the activity content object
 */
export const serialize = (data: ActivityContentNote | ActivityContentProfile): string => {
  const sortedData = sortObject((data as unknown) as Record<string, unknown>);
  return JSON.stringify(sortedData);
};
