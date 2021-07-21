import { ActivityContent } from "./factories";
import { sortObject } from "../utilities/json";

/**
 * serialize() converts an ActivityContent object to string for upload via the
 * storage adapter.
 *
 * @param data - The activity content object to hash
 * @returns A string representation of the activity content object
 */
export const serialize = (data: ActivityContent): string => {
  const sortedData = (sortObject((data as unknown) as Record<string, unknown>) as unknown) as ActivityContent;
  return JSON.stringify(sortedData);
};
