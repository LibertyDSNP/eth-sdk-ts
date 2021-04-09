import { keccak256 } from "js-sha3";
import { KeccakHash } from "../types/hash";

const sortJSON = (obj: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  Object.keys(obj)
    .sort()
    .forEach((key) => {
      if (typeof obj[key] == "object") {
        result[key] = sortJSON(obj[key] as Record<string, unknown>);
      } else {
        result[key] = obj[key];
      }
    });

  return result;
};

/**
 * activityPubHash() provides a simple way to hash activityPub objects while
 * guaranteeing that identical objects with different key orders still return
 * the same hash. The underlying hash method used is
 * [Keccak256](https://en.wikipedia.org/wiki/SHA-3).
 *
 * @param data  The activityPub object to hashes
 * @returns     A hexadecimal string containing the Keccak hash
 */
export const activityPubHash = (data: Record<string, unknown>): KeccakHash => {
  const sortedData = sortJSON(data as Record<string, unknown>);
  const jsonString = JSON.stringify(sortedData);
  return keccak256(jsonString);
};
