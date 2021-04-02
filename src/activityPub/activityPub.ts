import { keccak256 } from "js-sha3";
import { KeccakHash } from "../types/hash";
import { NotImplementedError } from "./errors";

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

export interface ActivityPub {
  "@context": string;
}

/**
 * hash() provides a simple way to hash activityPub objects while guaranteeing
 * that identical objects with different key orders still return the same hash.
 * The underlying hash method used is [Keccak256](https://en.wikipedia.org/wiki/SHA-3).
 *
 * @param   data  The activity pub object to hash
 * @returns       A hexadecimal string containing the Keccak hash
 */
export const hash = (data: ActivityPub): KeccakHash => {
  const sortedData = sortJSON(data as Record<string, unknown>);
  const jsonString = JSON.stringify(sortedData);
  return keccak256(jsonString);
};

interface ActivityPubCreateOpts {}

/**
 * create() provides a simple factory for generating activityPub objects. This
 * method is not yet implemented.
 *
 * @param   opts  Options for the created activity pub object
 * @returns       An activity pub object
 */
export const create = (opts: ActivityPubCreateOpts): ActivityPub => {
  throw NotImplementedError();
};

/**
 * validate() returns true if the object provided is a valid activityPub.
 * Otherwise, it returns false. This method is not yet implemented.
 *
 * @param   obj  An object to be validated against the activity pub standard
 * @returns      True or false depending on whether the given object is a valid
 */
export const validate = (obj: unknown): boolean => {
  throw NotImplementedError();
};
