import { keccak256 } from "js-sha3";
import { KeccakHash } from "../types/hash";

const sortJSON = (obj: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  Object.keys(obj)
    .sort()
    .forEach((key) => {
      if (typeof obj[key] == "object") {
        result[key] = sortJSON(obj[key] as Record<string, unknown>);
      } else {
        result[key] = obj[key];
      }
    });

  return result;
};

export const activityPubHash = (data: Record<string, unknown>): KeccakHash => {
  const sortedData = sortJSON(data as Record<string, unknown>);
  const jsonString = JSON.stringify(sortedData);
  return keccak256(jsonString);
};
