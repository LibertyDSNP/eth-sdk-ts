import { serialize, serializeToHex } from "./serialization";
import { createBroadcast } from "./factories";
import { BigNumber } from "ethers";
import { InvalidHexadecimalSerialization } from "../errors";

describe("serialization", () => {
  describe("#serialize", () => {
    it("returns the correct serialization for a given announcement", () => {
      const announcement = createBroadcast("dsnp://0x1", "https://dsnp.org/", "0x12345");
      const serializeAnnouncement = serialize(announcement);

      expect(serializeAnnouncement).toMatch(
        /announcementType0x2contentHash0x12345createdAt0x[0-9a-f]{1,13}fromId0x1urlhttps:\/\/dsnp\.org/
      );
    });

    it("can serialize the spec value", () => {
      const message = {
        announcementType: 1,
        fromId: "0x12345",
        contentHash: "0x67890",
        url: "https://www.dsnp.org/",
        createdAt: +new Date("2021-07-31T10:11:12"),
      };
      const serialized = serialize(message);
      expect(serialized).toEqual(
        "announcementType0x1contentHash0x67890createdAt0x17afc0bd600fromId0x12345urlhttps://www.dsnp.org/"
      );
    });

    it("can correct values with zero padding", () => {
      const message = {
        announcementType: 1,
        fromId: "0x000000012345",
        contentHash: "0x000067890",
        url: "https://www.dsnp.org/",
        createdAt: +new Date("2021-07-31T10:11:12"),
      };
      const serialized = serialize(message);
      expect(serialized).toEqual(
        "announcementType0x1contentHash0x67890createdAt0x17afc0bd600fromId0x12345urlhttps://www.dsnp.org/"
      );
    });
  });

  describe("#serializeToHex", () => {
    describe("succeeds with different types", () => {
      const expected = "0xabc123";

      const valid = [
        "dsnp://0xabc123", // dsnpUserUri
        "dsnp://0x000abc123", // dsnpUserUri leading zeros
        "dsnp://0xABC123", // dsnpUserUri uppercase
        0x000abc123, // Hex Number
        11256099, // Number
        BigNumber.from("0x000abc123"), // Big Number
        "0x000abc123", // string hex leading zeros
        "abc123", // string hex without prefix
        ["0xabc123"],
      ];

      for (const value of valid) {
        it(`for "${value}"`, () => {
          expect(serializeToHex(value)).toEqual(expected);
        });
      }

      it("for zero", () => {
        expect(serializeToHex("0x0")).toEqual("0x0");
        expect(serializeToHex(0)).toEqual("0x0");
      });
    });

    describe("throws error with bad values", () => {
      const valid = [
        "dsnp://0xabc123z", // dsnpUserUri z
        "0xzzzz", //  prefixed zzz
        "zzzz", // zzz
        [],
        {},
        null,
        "",
        true,
        false,
        { 0: "0xabc123" },
      ];

      for (const value of valid) {
        it(`for "${value}"`, () => {
          expect(() => serializeToHex(value)).toThrow(InvalidHexadecimalSerialization);
        });
      }
    });
  });
});
