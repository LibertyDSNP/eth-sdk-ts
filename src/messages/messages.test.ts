import { createBroadcastMessage, hash, DSNPType } from "./messages";

describe("messages", () => {
  describe("#hash", () => {
    it("returns the correct hash for a given message", () => {
      const message = createBroadcastMessage("1", "https://dsnp.org", "0x12345");

      expect(hash(message)).toEqual("bbf5c5ecdd31341fa8a2e90a87340ccab6580bb61d04bf14be03c996017e223b");
    });

    it("returns the same hash for two identical messages", () => {
      const message1 = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
      const message2 = createBroadcastMessage("1", "https://dsnp.org", "0x12345");

      expect(hash(message1)).toEqual(hash(message2));
    });

    it("returns the same hash for two identical messages with different key orders", () => {
      const message1 = {
        contentHash: "0x12345",
        fromId: "1",
        type: DSNPType.Broadcast,
        uri: "https://dsnp.org",
      };
      const message2 = {
        type: DSNPType.Broadcast,
        uri: "https://dsnp.org",
        contentHash: "0x12345",
        fromId: "1",
      };

      expect(hash(message1)).toEqual(hash(message2));
    });
  });
});
