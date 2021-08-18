import { Announcement } from "./factories";
import { DSNPUserId, DSNPUserURI } from "../identifiers";
import { BigNumber } from "ethers";
import { HexString } from "../../types/Strings";
import { InvalidHexadecimalSerialization } from "../errors";

export type HexSerializable = BigNumber | HexString | DSNPUserId | DSNPUserURI | number | bigint | unknown;

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

/**
 * serializeToHex() takes in just about anything and attempts to coerce the value to DSNP hexadecimal standard
 *
 * @param value - DSNP User Id/URI BigNumber BigInt number and even unknown
 * @throws {@link InvalidHexadecimalSerialization}
 * Thrown if the coercion failed
 * @returns A hexadecimal serialized value
 */
export const serializeToHex = (value: HexSerializable): HexString => {
  if (typeof value === "number" || typeof value === "bigint") {
    return prefixAndStrip(value.toString(16));
  }
  if (BigNumber.isBigNumber(value)) {
    return prefixAndStrip(value.toHexString());
  }
  if (String(value) === "") {
    throw new InvalidHexadecimalSerialization(value, "");
  }
  const castAttempt = prefixAndStrip(String(value));
  if (castAttempt === "0x0" || castAttempt.match(/^0x[1-9a-f][0-9a-f]*$/)) {
    return castAttempt;
  }
  throw new InvalidHexadecimalSerialization(value, castAttempt);
};

const HEX_PREFIX_REGEX = /^dsnp:\/\/0x0*|0x0*/i;

const prefixAndStrip = (str: string): HexString => {
  const hex = str.replace(HEX_PREFIX_REGEX, "").toLowerCase();
  return `0x${hex || 0}`;
};

const PADDED_HEX_REGEX = /^0x0+[a-f0-9]*$/i;

const serializeValue = ([key, value]: [string, unknown]): [string, string] => {
  if (
    typeof value === "number" ||
    typeof value === "bigint" ||
    BigNumber.isBigNumber(value) ||
    String(value).match(PADDED_HEX_REGEX)
  ) {
    return [key, serializeToHex(value)];
  }
  return [key, String(value)];
};
