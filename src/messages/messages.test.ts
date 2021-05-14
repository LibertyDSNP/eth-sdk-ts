import { createBroadcastMessage, hash, sign, DSNPType } from "./messages";

describe("messages", () => {
  describe("#hash", () => {
    it("returns the same hash for two identical messages", () => {
      const message1 = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
      const message2 = createBroadcastMessage("1", "https://dsnp.org", "0x12345");

      expect(hash(message1)).toEqual(hash(message2));
    });

    it("returns different hashes for two different messages", () => {
      const message1 = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
      const message2 = createBroadcastMessage("2", "https://dsnp.org", "0x12345");

      expect(hash(message1)).not.toEqual(hash(message2));
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

  describe("#sign", () => {
    it("returns a valid signature for a valid private key and message", () => {
      const message = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
      const privateKey = new Uint8Array(
        [
          "6d",
          "ce",
          "fd",
          "57",
          "d9",
          "21",
          "dc",
          "57",
          "0e",
          "19",
          "8f",
          "6b",
          "d9",
          "df",
          "fc",
          "32",
          "95",
          "4a",
          "b0",
          "71",
          "18",
          "4c",
          "78",
          "07",
          "70",
          "cf",
          "45",
          "41",
          "dd",
          "23",
          "f6",
          "8e",
        ].map((x) => parseInt(x, 16))
      );

      expect(sign(privateKey, message)).toEqual(
        new Uint8Array([
          75,
          182,
          116,
          185,
          42,
          153,
          244,
          76,
          108,
          67,
          155,
          204,
          118,
          59,
          110,
          36,
          108,
          9,
          52,
          93,
          46,
          192,
          114,
          157,
          251,
          74,
          130,
          17,
          69,
          30,
          161,
          87,
          30,
          111,
          102,
          168,
          242,
          50,
          43,
          126,
          255,
          78,
          122,
          3,
          116,
          62,
          158,
          234,
          52,
          230,
          180,
          46,
          42,
          158,
          168,
          198,
          72,
          213,
          136,
          51,
          27,
          197,
          230,
          249,
        ])
      );
    });
  });
});
