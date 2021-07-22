//eslint-disable-next-line
require("dotenv").config();

import { ethers } from "ethers";

import { setConfig, getConfig } from "../config";
import { publish, dsnpBatchFilter } from "../core/contracts/publisher";
import { hash } from "../core/utilities";
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

    const testUrl = "http://www.testconst.com";
    const fileHash = hash("test");

    const publications = [{ announcementType: 0, fileUrl: testUrl, fileHash }];

    // create a batch
    await publish(publications);

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
