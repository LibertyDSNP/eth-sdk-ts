//eslint-disable-next-line
require("dotenv").config();
import { ethers } from "ethers";
import { keccak256 } from "js-sha3";
import { batch, dsnpBatchFilter } from "../core/contracts/announcement";
import { setConfig, getConfig } from "../config";
import { snapshotHardhat, revertHardhat } from "./hardhatRPC";

const TESTING_PRIVATE_KEY = String(process.env.TESTING_PRIVATE_KEY);
const RPC_URL = String(process.env.RPC_URL);
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

beforeEach(async () => {
  const oldConfig = await getConfig();
  await setConfig({
    contracts: {},
    provider: provider,
    signer: new ethers.Wallet(TESTING_PRIVATE_KEY, provider),
    store: oldConfig.store,
    queue: oldConfig.queue,
  });
});

describe("snapshot and revert", () => {
  it("clears changes after revert", async () => {
    const filter = await dsnpBatchFilter();
    jest.setTimeout(12000);

    // snapshot
    await snapshotHardhat(provider);

    const testUri = "http://www.testconst.com";
    const hash = "0x" + keccak256("test");

    const announcements = [{ dsnpType: 0, uri: testUri, hash: hash }];

    // create a batch
    await batch(announcements);

    const batchEventLogs1 = await provider.getLogs(filter);
    // confirm batch event exists
    expect(batchEventLogs1.length).toEqual(1);

    // revert
    await revertHardhat(provider);

    // confirm batch event has been reverted
    const batchEventsLogs2 = await provider.getLogs(filter);
    expect(batchEventsLogs2.length).toEqual(0);
  });
});
