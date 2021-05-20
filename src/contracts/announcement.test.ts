//eslint-disable-next-line
require("dotenv").config();
import { ethers } from "ethers";
import { keccak256 } from "js-sha3";

import { snapshotHardhat, revertHardhat } from "../test/hardhatRPC";
import { batch, decodeDSNPBatchEvents, Announcement } from "./announcement";
import { setConfig, getConfig } from "../config/config";

const TESTING_PRIVATE_KEY = String(process.env.TESTING_PRIVATE_KEY);
const RPC_URL = String(process.env.RPC_URL);
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(TESTING_PRIVATE_KEY, provider);

beforeEach(async () => {
  const config = await getConfig();
  config.provider = provider;
  config.signer = signer;
  await setConfig(config);

  await snapshotHardhat(provider);
});

afterEach(async () => {
  await revertHardhat(provider);
});

describe("#batch", () => {
  it("successfully posts a batch to the chain", async () => {
    jest.setTimeout(12000);

    const testUri = "http://www.testconst.com";
    const hash = "0x" + keccak256("test");

    const announcements: Announcement[] = [{ dsnpType: 0, uri: testUri, hash: hash }];

    await batch(announcements);

    const batchEvents = await decodeDSNPBatchEvents(provider);

    expect(batchEvents.length).toEqual(1);
    expect(batchEvents[0].uri).toEqual(testUri);
    expect(batchEvents[0].hash).toEqual(hash);
  });
});
