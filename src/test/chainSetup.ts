//eslint-disable-next-line
require("dotenv").config();
import { ethers, Signer } from "ethers";
import { setConfig } from "../config/config";
import { JsonRpcProvider } from "@ethersproject/providers/src.ts/json-rpc-provider";
import { revertHardhat, snapshotHardhat } from "./hardhatRPC";

const TESTING_PRIVATE_KEY = String(process.env.TESTING_PRIVATE_KEY);
const RPC_URL = String(process.env.RPC_URL);

let signer: Signer;
let provider: JsonRpcProvider;

beforeAll(async () => {
  provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  signer = new ethers.Wallet(TESTING_PRIVATE_KEY, provider);
});

beforeEach(async () => {
  await setConfig({
    provider,
    signer,
  });
  // Remember snapshots are used up each time they are reverted to, so beforeEach.
  await snapshotHardhat(provider);
});

afterEach(async () => {
  await revertHardhat(provider);
});
