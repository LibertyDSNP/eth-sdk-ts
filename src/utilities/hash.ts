export type KeccakHash = string;

export const hashPrefix = (hash: string): KeccakHash => {
  return hash.startsWith("0x", 0) ? hash : `0x${hash}`;
};
