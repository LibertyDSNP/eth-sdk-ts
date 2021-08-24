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
    const validDSNPUserURIs = ["dsnp://0xa123456789abcdef"];

    const invalidDSNPUserURIs = [
      "dsnp://123", // hex
      "dsnp://badwolf", // Bad user URI
      "dsnp://184467440737095516150", // URI too long
    ];

    for (const id of validDSNPUserURIs) {
      it(`returns true for "${id}"`, () => {
        expect(isDSNPUserURI(id)).toEqual(true);
      });
    }

    for (const id of invalidDSNPUserURIs) {
      it(`returns false for "${id}"`, () => {
        expect(isDSNPUserURI(id)).toEqual(false);
      });
    }
  });

  describe("isDSNPAnnouncementURI", () => {
    const validDSNPAnnouncementURIs = [
      "dsnp://0xa123456789abcdef/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // Lowercase
    ];

    const invalidDSNPAnnouncementURIs = [
      "dsnp://0xa123456789ABCDEF/0xa123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // Uppercase
      "dsnp://0x0000456789abcdef/0x0000456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // Leading Zeros
      "dsnp://0123456789abcdef/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // No 0x on user
      "dsnp://0xa123456789abcdef/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // No 0x on announcement
      "dsnp://0123456789abcdef/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // No 0x on either
      "dsnp://0xbadwolf/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // Bad user URI
      "dsnp://0x0000456789abcdef/0xbadwolf", // Bad announcement URI
      "dsnp://0xa123456789abcdefa/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // User URI too long
      "dsnp://0xa123456789abcdef/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdefa", // Announcement Uri too short
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
        "0x0123456789abcdef",
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
      expect(id).toEqual("dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
    });

    it("returns valid DSNP Announcement Uri with a DSNP Uri", () => {
      const id = buildDSNPAnnouncementURI(
        "dsnp://0x0123456789abcdef",
        "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
      expect(id).toEqual("dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef");
    });
  });

  describe("parseDSNPAnnouncementURI", () => {
    it("returns userId and contentHash", () => {
      const id = parseDSNPAnnouncementURI(
        "dsnp://0x123456789abcdef/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
      expect(id).toEqual({
        userId: "0x123456789abcdef",
        contentHash: "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      });
    });
  });

  describe("convertToDSNPUserURI", () => {
    it("big number", () => {
      expect(convertToDSNPUserURI(BigNumber.from(4660))).toEqual("dsnp://0x1234");
    });

    it("number", () => {
      expect(convertToDSNPUserURI(4660)).toEqual("dsnp://0x1234");
    });

    it("hex string", () => {
      expect(convertToDSNPUserURI("0x0001234")).toEqual("dsnp://0x1234");
    });

    it("dsnp user uri", () => {
      expect(convertToDSNPUserURI("dsnp://0x1234")).toEqual("dsnp://0x1234");
    });
  });

  describe("convertToDSNPUserId", () => {
    it("big number", () => {
      expect(convertToDSNPUserId(BigNumber.from(4660))).toEqual("0x1234");
    });

    it("number", () => {
      expect(convertToDSNPUserId(4660)).toEqual("0x1234");
    });

    it("hex string", () => {
      expect(convertToDSNPUserId("0x0001234")).toEqual("0x1234");
    });

    it("dsnp user uri", () => {
      expect(convertToDSNPUserId("dsnp://0x1234")).toEqual("0x1234");
    });
  });
});
