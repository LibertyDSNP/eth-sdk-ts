import {
  buildDSNPAnnouncementURI,
  convertToDSNPUserId,
  convertToDSNPUserURI,
  isDSNPAnnouncementURI,
  isDSNPUserURI,
  parseDSNPAnnouncementURI,
} from "./identifiers";
import { BigNumber } from "ethers";

describe("identifiers", () => {
  describe("isDSNPUserURI", () => {
    const validDSNPUserURIs = ["dsnp://11611200575284957000"];

    const invalidDSNPUserURIs = [
      "dsnp://0x123", // hex
      "dsnp://badwolf", // Bad user URI
      "dsnp://184467440737095516150", // URI too long
      "dssp://1234", // Invalid protocol
      "dsnp://01234", // Leading 0 in URI
    ];

    for (const id of validDSNPUserURIs) {
      it(`returns true for "${id}"`, () => {
        expect(isDSNPUserURI(id)).toEqual(true);
      });
    }

    for (const id of invalidDSNPUserURIs) {
      it(`throws for "${id}"`, () => {
        expect(() => {
          isDSNPUserURI(id);
        }).toThrow();
      });
    }
  });

  describe("isDSNPAnnouncementURI", () => {
    const validDSNPAnnouncementURIs = [
      "dsnp://11611200575284957000/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // Lowercase
    ];

    const invalidDSNPAnnouncementURIs = [
      "dsnp://11611200575284957000/0xa123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // Uppercase
      "dsnp://0x0123456789abcdef/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // 0x on user
      "dsnp://11611200575284957000/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // No 0x on announcement
      "dsnp://badwolf/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // Bad user URI
      "dsnp://11611200575284957000/0xbadwolf", // Bad announcement URI
      "dsnp://184467440737095516150/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // User URI too long
      "dsnp://11611200575284957000/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdefa", // Announcement Uri too short
    ];

    for (const id of validDSNPAnnouncementURIs) {
      it(`returns true for "${id}"`, () => {
        expect(isDSNPAnnouncementURI(id)).toEqual(true);
      });
    }

    for (const id of invalidDSNPAnnouncementURIs) {
      it(`returns false for "${id}"`, () => {
        expect(isDSNPAnnouncementURI(id)).toEqual(false);
      });
    }
  });

  describe("buildDSNPAnnouncementURI", () => {
    it("returns valid DSNP Announcement Uris", () => {
      const id = buildDSNPAnnouncementURI(
        "11611200575284957000",
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
      expect(id).toEqual(
        "dsnp://11611200575284957000/0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
    });

    it("returns valid DSNP Announcement Uri with a DSNP Uri", () => {
      const id = buildDSNPAnnouncementURI(
        "dsnp://11611200575284957000",
        "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
      expect(id).toEqual(
        "dsnp://11611200575284957000/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
    });
  });

  describe("parseDSNPAnnouncementURI", () => {
    it("returns userId and contentHash", () => {
      const id = parseDSNPAnnouncementURI(
        "dsnp://11611200575284957000/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
      expect(id).toEqual({
        userId: BigInt("11611200575284957000"),
        contentHash: "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      });
    });
  });

  describe("convertToDSNPUserURI", () => {
    it("big number", () => {
      expect(convertToDSNPUserURI(BigNumber.from(4660))).toEqual("dsnp://4660");
    });

    it("number", () => {
      expect(convertToDSNPUserURI(4660)).toEqual("dsnp://4660");
    });

    it("hex string", () => {
      expect(convertToDSNPUserURI("0x0001234")).toEqual("dsnp://4660");
    });

    it("dsnp user uri", () => {
      expect(convertToDSNPUserURI("dsnp://4660")).toEqual("dsnp://4660");
    });
  });

  describe("convertToDSNPUserId", () => {
    it("big number", () => {
      expect(convertToDSNPUserId(BigNumber.from(4660))).toEqual(BigInt(4660));
    });

    it("number", () => {
      expect(convertToDSNPUserId(4660)).toEqual(BigInt(4660));
    });

    it("hex string", () => {
      expect(convertToDSNPUserId("0x0001234")).toEqual(BigInt(4660));
    });

    it("dsnp user uri", () => {
      expect(convertToDSNPUserId("dsnp://4660")).toEqual(BigInt(4660));
    });
  });
});
