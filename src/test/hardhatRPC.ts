/* eslint @typescript-eslint/no-var-requires: "off" */
require("dotenv").config();
import { ethers } from "ethers";

const latestSnapshot: string[] = [];

export const snapshotHardhat = async (provider: ethers.providers.JsonRpcProvider): Promise<void> => {
  latestSnapshot.push(await provider.send("evm_snapshot", []));
};

export const revertHardhat = async (provider: ethers.providers.JsonRpcProvider): Promise<void> => {
  const revertResponse = await provider.send("evm_revert", [latestSnapshot.pop()]);

  expect(revertResponse.error).toBeUndefined();
};
