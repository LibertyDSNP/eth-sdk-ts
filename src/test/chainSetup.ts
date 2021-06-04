/* eslint @typescript-eslint/no-var-requires: "off" */
require("dotenv").config();
import { ethers } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers/src.ts/json-rpc-provider";
import { revertHardhat, snapshotHardhat } from "./hardhatRPC";

const RPC_URL = String(process.env.RPC_URL);

let provider: JsonRpcProvider;

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