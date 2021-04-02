import { HexString } from "../types/Strings";

export type KeccakHash = HexString;

export const hashPrefix = (hash: string): KeccakHash => {
  return hash.startsWith("0x", 0) ? hash : `0x${hash}`;
};
