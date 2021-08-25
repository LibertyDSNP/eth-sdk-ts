import { HexString } from "../../types/Strings";

/**
 * hexToUint8Array() converts buffers into hexadecimal representation
 *
 * @param hex - The hexadecimal string translate to a Uint8Array
 * @returns The Uint8Array
 */
export const hexToUint8Array = (hex: HexString): Uint8Array => {
  const rawHex = hex.replace(/^0x/, "");
  const out = new Uint8Array(rawHex.length / 2);
  for (let idx = 0, edx = rawHex.length; idx < edx; idx = idx + 2) {
    const key = idx === 0 ? 0 : idx / 2;
    out[key] = parseInt(`${rawHex[idx]}${rawHex[idx + 1]}`, 16);
  }
  return out;
};

// via https://blog.xaymar.com/2020/12/08/fastest-uint8array-to-hex-string-conversion-in-javascript/
const LUT_HEX_4B = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
const LUT_HEX_8B = new Array(0x100);
for (let i = 0; i < 0x100; i++) {
  LUT_HEX_8B[i] = `${LUT_HEX_4B[(i >>> 4) & 0xf]}${LUT_HEX_4B[i & 0xf]}`;
}

/**
 * uint8ArrayToHex() converts buffers into hexadecimal representation
 *
 * @param arr - The array or buffer to translate to hexadecimal
 * @returns The hexadecimal string with a 0x prefix
 */
export const uint8ArrayToHex = (arr: Uint8Array | Buffer): HexString => {
  let out = "";
  for (let idx = 0, edx = arr.length; idx < edx; idx++) {
    out += LUT_HEX_8B[arr[idx]];
  }
  return `0x${out}`;
};
