import { keccak256 } from "js-sha3";

import { publish, Publication } from "./publisher";
import { setupConfig } from "../../test/sdkTestConfig";
import { setupSnapshot } from "../../test/hardhatRPC";
import { requireGetProvider } from "../../config";

describe("#batch", () => {
  setupSnapshot();

  beforeAll(setupConfig);

  it("successfully publishes a batch to the chain", async () => {
    jest.setTimeout(12000);

    const testUrl = "http://www.testconst.com";
    const hash = "0x" + keccak256("test");

    const publications: Publication[] = [{ announcementType: 0, fileUrl: testUrl, fileHash: hash }];

    await publish(publications);
    const provider = requireGetProvider();
    const logs = await provider.getLogs({ fromBlock: "latest" });
    expect(logs).toHaveLength(1);
    expect(logs[0].data).toEqual(
      "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb65800000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000018687474703a2f2f7777772e74657374636f6e73742e636f6d0000000000000000"
    );
  });
});
