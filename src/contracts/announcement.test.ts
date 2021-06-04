import { keccak256 } from "js-sha3";

import { batch, decodeDSNPBatchEvents, Announcement } from "./announcement";
import { setupConfig } from "../test/sdkTestConfig";

describe("#batch", () => {
  beforeAll(setupConfig);

  it("successfully posts a batch to the chain", async () => {
    jest.setTimeout(12000);

    const testUri = "http://www.testconst.com";
    const hash = "0x" + keccak256("test");

    const announcements: Announcement[] = [{ dsnpType: 0, uri: testUri, hash: hash }];

    await batch(announcements);

    const batchEvents = await decodeDSNPBatchEvents();

    expect(batchEvents.length).toEqual(1);
    expect(batchEvents[0].uri).toEqual(testUri);
    expect(batchEvents[0].hash).toEqual(hash);
  });
});
