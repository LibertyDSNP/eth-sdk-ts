import { buildDSNPAnnouncementId, isDSNPAnnouncementId } from "./identifiers";

describe("identifiers", () => {
  describe("isDSNPAnnouncementId", () => {
    const validDSNPAnnouncementIds = [
      "dsnp://0x0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // Uppercase
      "dsnp://0x0123456789abcdef/0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // Lowercase
    ];

    const invalidDSNPAnnouncementIds = [
      "dsnp://0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // No 0x on user
      "dsnp://0x0123456789abcdef/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // No 0x on announcement
      "dsnp://0123456789abcdef/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // No 0x on either
      "dsnp://0xbadbadbad/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // Bad user id
      "dsnp://0x0123456789ABCDEF/0xbadbadbad", // Bad message id
      "dsnp://0x0123456789ABCDE/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // User id too short
      "dsnp://0x0123456789ABCDEFA/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // User id too long
      "dsnp://0x0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDE", // Announcement id too short
    ];

    for (const id of validDSNPAnnouncementIds) {
      it(`returns true for "${id}"`, () => {
        expect(isDSNPAnnouncementId(id)).toEqual(true);
      });
    }

    for (const id of invalidDSNPAnnouncementIds) {
      it(`returns false for "${id}"`, () => {
        expect(isDSNPAnnouncementId(id)).toEqual(false);
      });
    }
  });

  describe("buildDSNPAnnouncementId", () => {
    it("returns valid DSNP announcement ids", () => {
      const id = buildDSNPAnnouncementId(
        "dsnp://0x0123456789ABCDEF",
        "0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
      );
      expect(id).toEqual(
        "dsnp://0x0123456789ABCDEF/0x0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF"
      );
    });
  });
});
