import { keccak256, Message } from "js-sha3";

import { HexString } from "../../types/Strings";

/**
 * hash() takes a string and returns a keccak256 hash string with a 0x prefix.
 *
 * @param content - The string content to hash
 * @returns A 0x prefixed keccak256 hash
 */
export const hash = (content: Message): HexString => `0x${keccak256(content)}`;

/**
 * HashGenerator is a simple generator for building keccak256 hashes
 * iteratively. It includes an update function which allows the user to append
 * content to be hashed and a hex function which returns the 0x prefixed
 * keccak256 hash for the content.
 */
export interface HashGenerator {
  update: (chunk: Uint8Array) => void;
  hex: () => HexString;
}

/**
 * getHashGenerator() returns a hash generator function which a user can call to
 * append content to a hash and get the digest when done.
 *
 * @returns A hash generator
 */
export const getHashGenerator = (): HashGenerator => {
  const generator = keccak256.create();
  return {
    update: (chunk: Uint8Array): void => {
      generator.update(chunk);
    },
    hex: (): HexString => {
      return `0x${generator.hex()}`;
    },
  };
};
