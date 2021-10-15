import { HexString } from "../../types/Strings";

const ALPHA = "abcdefghijklmnopqrstuvwxyz0123456789";
const HEX = "0123456789ABCDEF";

/**
 * getRandomString() returns a randomly generated alphanumeric string of the
 * given length. If no length is provided, the result will be 32 characters.
 * Note that this function does not use cryptographically secure randomness and
 * as such should not be used for cryptographic purposes.
 *
 * @param length - Optional. The length of the string to generate
 * @returns A randomly generated alphanumeric string
 */
export const getRandomString = (length?: number): string => {
  let string = "";

  for (let i = 0; i < (length || 32); i++) {
    const index = Math.floor(Math.random() * ALPHA.length);
    string += ALPHA[index];
  }

  return string;
};

/**
 * getRandomHex() returns a randomly generated hexadecimal string of the given
 * length. If no length is provided, the result will be 32 characters. Note
 * that this function does not use cryptographically secure randomness and as
 * such should not be used for cryptographic purposes.
 *
 * @param length - Optional. The length of the string to generate
 * @returns A randomly generated hexadecimal string
 */
export const getRandomHex = (length?: number): HexString => {
  let string = "";

  for (let i = 0; i < (length || 32); i++) {
    const index = Math.floor(Math.random() * HEX.length);
    string += HEX[index];
  }

  return `0x${string}`;
};
