import { AnnouncementType } from "../announcements";
import { publish, Publication, dsnpBatchFilter } from "./publisher";
import { hash } from "../utilities";
import { setupConfig } from "../../test/sdkTestConfig";
import { setupSnapshot } from "../../test/hardhatRPC";
import { requireGetProvider } from "../config";

describe("#batch", () => {
  setupSnapshot();

  beforeAll(setupConfig);

  it("successfully publishes a batch to the chain", async () => {
    jest.setTimeout(12000);

    const testUrl = "http://www.testconst.com";
    const fileHash = hash("test");

    const publications: Publication[] = [{ announcementType: 0, fileUrl: testUrl, fileHash }];

    await publish(publications);
    const provider = requireGetProvider();
    const logs = await provider.getLogs({ fromBlock: "latest" });
    expect(logs).toHaveLength(1);
    expect(logs[0].data).toEqual(
      "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb65800000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000018687474703a2f2f7777772e74657374636f6e73742e636f6d0000000000000000"
    );
  });

  describe("dsnpBatchFilter", () => {
    it("can return the topic", () => {
      expect(dsnpBatchFilter().topics).toEqual(["0xe63a4904ccacc079f71e52aad2cf99c00a7d4963566562a94d7c07610f1df576"]);
    });

    it("can return the topics with a type filter", () => {
      expect(dsnpBatchFilter(AnnouncementType.GraphChange).topics).toEqual([
        "0xe63a4904ccacc079f71e52aad2cf99c00a7d4963566562a94d7c07610f1df576",
        "0x0000000000000000000000000000000000000000000000000000000000000001",
      ]);
    });

    it("can return the correct topics for Tombstones", () => {
      expect(dsnpBatchFilter(AnnouncementType.Tombstone).topics).toEqual([
        "0xe63a4904ccacc079f71e52aad2cf99c00a7d4963566562a94d7c07610f1df576",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      ]);
    });
  });
});
