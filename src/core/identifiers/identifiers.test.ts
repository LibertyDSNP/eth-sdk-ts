import {
  buildDSNPAnnouncementURI,
  convertBigNumberToDSNPUserId,
  convertBigNumberToDSNPUserURI,
  convertDSNPUserIdOrURIToBigNumber,
  convertDSNPUserURIToDSNPUserId,
  isDSNPAnnouncementURI,
  isDSNPUserURI,
  parseDSNPAnnouncementURI,
} from "./identifiers";
import { BigNumber } from "ethers";

describe("identifiers", () => {
  describe("isDSNPUserURI", () => {
    const validDSNPUserURIs = [
      "dsnp://0xa123456789abcdef", // Lowercase
    ];

    const invalidDSNPUserURIs = [
      "dsnp://0xa123456789ABCDEF", // Uppercase
      "dsnp://0x0000456789abcdef", // Leading Zeros
      "dsnp://0123456789abcdef", // No 0x user
      "dsnp://0xbadwolf", // Bad user URI
      "dsnp://0xa123456789abcdefa", // URI too long
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

  describe("convertBigNumberToDSNPUserId", () => {
    it("is prefixed with 0x", () => {
      expect(convertBigNumberToDSNPUserId(BigNumber.from(4660))).toEqual("0x1234");
    });
  });

  describe("convertDSNPUserIdOrURIToBigNumber", () => {
    it("can convert a DSNP URI", () => {
      const result = convertDSNPUserIdOrURIToBigNumber("dsnp://0x1234");
      expect(BigNumber.isBigNumber(result)).toBeTruthy();
      expect(result.toNumber()).toEqual(0x1234);
    });

    it("can convert a DSNP Id", () => {
      const result = convertDSNPUserIdOrURIToBigNumber("0x01234");
      expect(BigNumber.isBigNumber(result)).toBeTruthy();
      expect(result.toNumber()).toEqual(0x1234);
    });

    it("can convert a DSNP Id even without the prefix", () => {
      const result = convertDSNPUserIdOrURIToBigNumber("1234");
      expect(BigNumber.isBigNumber(result)).toBeTruthy();
      expect(result.toNumber()).toEqual(0x1234);
    });
  });

  describe("convertBigNumberToDSNPUserURI", () => {
    it("has no zero padding", () => {
      const result = convertBigNumberToDSNPUserURI(BigNumber.from("0x000000123"));
      expect(result).toEqual("dsnp://0x123");
    });
  });

  describe("convertDSNPUserURIToDSNPUserId", () => {
    it("returns no leading zeros", () => {
      const result = convertDSNPUserURIToDSNPUserId("dsnp://0x123");
      expect(result).toEqual("0x123");
    });
  });
});
