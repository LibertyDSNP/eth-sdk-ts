export const hashPrefix = (hash: string): string => {
  return hash.startsWith("0x", 0) ? hash : `0x${hash}`;
};
