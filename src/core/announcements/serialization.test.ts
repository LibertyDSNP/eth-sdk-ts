import { serialize } from "./serialization";
import { createBroadcast } from "./factories";

describe("serialization", () => {
  describe("#serialize", () => {
    it("returns the correct serialization for a given announcement", () => {
      const announcement = createBroadcast("dsnp://1", "https://dsnp.org/", "0x12345");
      const serializeAnnouncement = serialize(announcement);

      expect(serializeAnnouncement).toMatch(
        /announcementType2contentHash0x12345createdAt[0-9]{1,20}fromId1urlhttps:\/\/dsnp\.org/
      );
    });

    describe("spec examples", () => {
      const expectedSerialization =
        "announcementType1contentHash0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658createdAt1627726272000fromId74565urlhttps://www.dsnp.org/";
      it("can serialize", () => {
        const message = {
          announcementType: 1,
          fromId: BigInt(74565),
          contentHash: "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658",
          url: "https://www.dsnp.org/",
          createdAt: BigInt(+new Date("2021-07-31T10:11:12Z")),
        };
        const serialized = serialize(message);
        expect(serialized).toEqual(expectedSerialization);
      });
    });
  });
});
