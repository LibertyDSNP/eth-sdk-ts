import { keccak256 } from "js-sha3";
import { HexString } from "../types/Strings";
import { NotImplementedError } from "../utilities/errors";
import { sortObject } from "../utilities/json";

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
export const hash = (data: ActivityPub): HexString => {
  const sortedData = (sortObject((data as unknown) as Record<string, unknown>) as unknown) as ActivityPub;
  const jsonString = JSON.stringify(sortedData);
  return keccak256(jsonString);
};

export interface ActivityPubCreateOpts {
  title: string;
  description: string;
}

/**
 * create() provides a simple factory for generating activityPub objects. This
 * method is not yet implemented.
 *
 * @param   opts  Options for the created activity pub object
 * @returns       An activity pub object
 */
export const create = (_opts: ActivityPubCreateOpts): ActivityPub => {
  throw NotImplementedError;
};

/**
 * validate() returns true if the object provided is a valid activityPub.
 * Otherwise, it returns false. This method is not yet implemented.
 *
 * @param   obj  An object to be validated against the activity pub standard
 * @returns      True or false depending on whether the given object is a valid
 */
export const validate = (_obj: unknown): boolean => {
  throw NotImplementedError;
};