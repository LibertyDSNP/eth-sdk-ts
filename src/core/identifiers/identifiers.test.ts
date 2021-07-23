import { buildDSNPAnnouncementUri, isDSNPAnnouncementUri, parseDSNPAnnouncementUri } from "./identifiers";

describe("identifiers", () => {
  describe("isDSNPAnnouncementUri", () => {
    const validDSNPAnnouncementUris = [
      "dsnp://0x0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // Uppercase
      "dsnp://0x0123456789abcdef/0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // Lowercase
    ];

    const invalidDSNPAnnouncementUris = [
      "dsnp://0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // No 0x on user
      "dsnp://0x0123456789abcdef/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // No 0x on announcement
      "dsnp://0123456789abcdef/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // No 0x on either
      "dsnp://0xbadwolf/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // Bad user id
      "dsnp://0x0123456789ABCDEF/0xbadbadbad", // Bad message id
      "dsnp://0x0123456789ABCDEFA/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // User id too long
      "dsnp://0x0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDE", // Announcement Uri too short
    ];

    for (const id of validDSNPAnnouncementUris) {
      it(`returns true for "${id}"`, () => {
        expect(isDSNPAnnouncementUri(id)).toEqual(true);
      });
    }

    for (const id of invalidDSNPAnnouncementUris) {
      it(`returns false for "${id}"`, () => {
        expect(isDSNPAnnouncementUri(id)).toEqual(false);
      });
    }
  });

  describe("buildDSNPAnnouncementUri", () => {
    it("returns valid DSNP Announcement Uris", () => {
      const id = buildDSNPAnnouncementUri(
        "0x0123456789ABCDEF",
        "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
      );
      expect(id).toEqual(
        "dsnp://0x0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
      );
    });

    it("returns valid DSNP Announcement Uri with a DSNP Uri", () => {
      const id = buildDSNPAnnouncementUri(
        "dsnp://0x0123456789ABCDEF",
        "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
      );
      expect(id).toEqual(
        "dsnp://0x0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
      );
    });
  });

  describe("parseDSNPAnnouncementUri", () => {
    it("returns userId and contentHash", () => {
      const id = parseDSNPAnnouncementUri(
        "dsnp://0x0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
      );
      expect(id).toEqual({
        userId: "0x0123456789ABCDEF",
        contentHash: "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF",
      });
    });
  });
});
