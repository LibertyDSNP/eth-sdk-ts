import { HexString } from "types/Strings";

export const hashPrefix = (hash: string): HexString => {
  return hash.startsWith("0x", 0) ? hash : `0x${hash}`;
};
