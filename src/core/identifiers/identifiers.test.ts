import { buildDSNPAnnouncementURI, isDSNPAnnouncementURI, parseDSNPAnnouncementURI } from "./identifiers";

describe("identifiers", () => {
  describe("isDSNPAnnouncementURI", () => {
    const validDSNPAnnouncementURIs = [
      "dsnp://0x0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // Uppercase
      "dsnp://0x0123456789abcdef/0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // Lowercase
    ];

    const invalidDSNPAnnouncementURIs = [
      "dsnp://0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // No 0x on user
      "dsnp://0x0123456789abcdef/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // No 0x on announcement
      "dsnp://0123456789abcdef/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // No 0x on either
      "dsnp://0xbadwolf/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // Bad user URI
      "dsnp://0x0123456789ABCDEF/0xbadbadbad", // Bad message id
      "dsnp://0x0123456789ABCDEFA/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // User URI too long
      "dsnp://0x0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDE", // Announcement Uri too short
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
        "0x0123456789ABCDEF",
        "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
      );
      expect(id).toEqual(
        "dsnp://0x0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
      );
    });

    it("returns valid DSNP Announcement Uri with a DSNP Uri", () => {
      const id = buildDSNPAnnouncementURI(
        "dsnp://0x0123456789ABCDEF",
        "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
      );
      expect(id).toEqual(
        "dsnp://0x0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
      );
    });
  });

  describe("parseDSNPAnnouncementURI", () => {
    it("returns userId and contentHash", () => {
      const id = parseDSNPAnnouncementURI(
        "dsnp://0x0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
      );
      expect(id).toEqual({
        userId: "0x0123456789ABCDEF",
        contentHash: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
      });
    });
  });
});
