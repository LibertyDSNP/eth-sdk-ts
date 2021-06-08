const alpha = "abcdefghijklmnopqrstuvwxyz0123456789";

/**
 * getRandomString() returns a randomly generated alphanumeric string of the
 * given length. If no length is provided, the result will be 32 characters.
 * Note that this function does not use cryptographically secure randomness and
 * as such should not be used for cryptographic purposes.
 *
 * @param length Optional. The length of the string to generate
 * @returns      A randomly generated alphanumeric string
 */
export const getRandomString = (length?: number): string => {
  let string = "";

  for (let i = 0; i < (length || 32); i++) {
    const index = Math.floor(Math.random() * alpha.length);
    string += alpha[index];
  }

  return string;
};
