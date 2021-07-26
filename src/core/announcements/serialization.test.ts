import { serialize } from "./serialization";
import { createBroadcast } from "./factories";

describe("serialization", () => {
  describe("#serialize", () => {
    it("returns the correct serialization for a given announcement", async () => {
      const announcement = createBroadcast("1", "https://dsnp.org", "0x12345");
      const serializeAnnouncement = await serialize(announcement);

      expect(serializeAnnouncement).toMatch(
        /announcementType2contentHash0x12345createdAt[0-9]{13}fromId1urlhttps:\/\/dsnp\.org/
      );
    });
  });
});
