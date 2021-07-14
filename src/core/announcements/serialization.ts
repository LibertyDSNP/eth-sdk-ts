import { sortObject } from "../utilities/json";
import { Announcement } from "./factories";

/**
 * serialize() takes an announcement and returns a serialized string.
 *
 * @param announcement - The announcement to serialized
 * @returns A string serialization of the announcement
 */
export const serialize = (announcement: Announcement): string => {
  const sortedObj = sortObject((announcement as unknown) as Record<string, unknown>);
  let serialization = "";

  for (const key in sortedObj) {
    serialization = `${serialization}${key}${sortedObj[key]}`;
  }

  return serialization;
};
