/* eslint @typescript-eslint/no-var-requires: "off" */
require("dotenv").config();
import { ethers } from "ethers";

const RPC_URL = String(process.env.RPC_URL);

const latestSnapshot: string[] = [];

export const snapshotHardhat = async (provider: ethers.providers.JsonRpcProvider): Promise<void> => {
  latestSnapshot.push(await provider.send("evm_snapshot", []));
};

export const revertHardhat = async (provider: ethers.providers.JsonRpcProvider): Promise<void> => {
  const revertResponse = await provider.send("evm_revert", [latestSnapshot.pop()]);

  expect(revertResponse.error).toBeUndefined();
};

export const snapshotSetup = (): void => {
  let provider: ethers.providers.JsonRpcProvider;

  beforeAll(async () => {
    provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  });

  beforeEach(async () => {
    // Remember snapshots are used up each time they are reverted to, so beforeEach.
    await snapshotHardhat(provider);
  });

  afterEach(async () => {
    await revertHardhat(provider);
  });
};
