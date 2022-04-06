import {
  buildDSNPContentURI,
  convertToDSNPUserId,
  convertToDSNPUserURI,
  isDSNPContentURI,
  isDSNPUserURI,
  parseDSNPContentURI,
} from "./identifiers";
import { InvalidContentUriError } from "./errors";
import { BigNumber } from "ethers";

describe("identifiers", () => {
  describe("isDSNPUserURI", () => {
    const validDSNPUserURIs = ["dsnp://11611200575284957000"];

    const invalidDSNPUserURIs = [
      "dsnp://0x123", // hex
      "dsnp://badwolf", // Bad user URI
      "dsnp://184467440737095516150", // URI too long
      "dssp://1234", // Invalid protocol
      "dsnp://01234", // Begins with a 0
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

  describe("isDSNPContentURI", () => {
    const validDSNPContentURIs = [
      "dsnp://11611200575284957000/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // Lowercase
    ];

    const invalidDSNPContentURIs = [
      "dsnp://11611200575284957000/0xa123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // Uppercase
      "dsnp://0x0123456789abcdef/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // 0x on user
      "dsnp://11611200575284957000/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // No 0x on announcement
      "dsnp://badwolf/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // Bad user URI
      "dsnp://11611200575284957000/0xbadwolf", // Bad content uri
      "dsnp://184467440737095516150/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // User URI too long
      "dsnp://11611200575284957000/0xa123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdefa", // Content Uri too short
    ];

    for (const id of validDSNPContentURIs) {
      it(`returns true for "${id}"`, () => {
        expect(isDSNPContentURI(id)).toEqual(true);
      });
    }

    for (const id of invalidDSNPContentURIs) {
      it(`returns false for "${id}"`, () => {
        expect(isDSNPContentURI(id)).toEqual(false);
      });
    }
  });

  describe("buildDSNPContentURI", () => {
    it("returns valid DSNP Content Uris", () => {
      const id = buildDSNPContentURI(
        "11611200575284957000",
        "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
      expect(id).toEqual(
        "dsnp://11611200575284957000/0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
    });

    it("returns valid DSNP Content Uri with a DSNP Uri", () => {
      const id = buildDSNPContentURI(
        "dsnp://11611200575284957000",
        "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
      expect(id).toEqual(
        "dsnp://11611200575284957000/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
      );
    });
  });

  describe("parseDSNPContentURI", () => {
    it("returns userId and contentHash", () => {
      const id = parseDSNPContentURI(
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

    it("number as string", () => {
      expect(convertToDSNPUserId("4660")).toEqual(BigInt(4660));
    });

    it("hex string", () => {
      expect(convertToDSNPUserId("0x0001234")).toEqual(BigInt(4660));
    });

    it("dsnp user uri", () => {
      expect(convertToDSNPUserId("dsnp://4660")).toEqual(BigInt(4660));
    });

    it("throws for invalid uri", () => {
      expect(() => {
        convertToDSNPUserId("dsnp://034b");
      }).toThrow(InvalidContentUriError);
    });
  });
});
