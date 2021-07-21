import { keccak256 } from "js-sha3";

import { HexString } from "../../types/Strings";

/**
 * hash() takes a string and returns a keccak256 hash string with a 0x prefix.
 *
 * @param content - The string content to hash
 * @returns A 0x prefixed keccak256 hash
 */
export const hash = (content: string): HexString => `0x${keccak256(content)}`;
