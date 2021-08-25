import { Announcement } from "./factories";
import { BigNumber } from "ethers";

/**
 * serialize() takes an announcement and returns a serialized string.
 *
 * @param announcement - The announcement to serialized
 * @returns A string serialization of the announcement
 */
export const serialize = (announcement: Announcement): string => {
  return Object.entries(announcement)
    .map(serializeValue)
    .sort(([aKey], [bKey]) => aKey.localeCompare(bKey, "us"))
    .reduce((serialization, [key, value]) => `${serialization}${key}${value}`, "");
};

const serializeValue = ([key, value]: [string, unknown]): [string, string] => {
  if (typeof value === "number" || typeof value === "bigint" || BigNumber.isBigNumber(value)) {
    return [key, value.toString()];
  }
  return [key, String(value)];
};
