import { validateDSNPMessageId } from "./identifiers";

describe("validateDSNPMessageId", () => {
  const validDSNPMessageIds = [
    "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // Uppercase
    "dsnp://0123456789abcdef/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // Lowercase
  ];

  const invalidDSNPMessageIds = [
    "dsnp://badbadbad/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // Bad user id
    "dsnp://0123456789ABCDEF/badbadbad", // Bad message id
    "dsnp://0123456789ABCDE/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // User id too short
    "dsnp://0123456789ABCDEFA/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF", // User id too long
    "dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDE", // Message id too short
  ];

  for (const id of validDSNPMessageIds) {
    it(`returns true for "${id}"`, () => {
      expect(validateDSNPMessageId(id)).toEqual(true);
    });
  }

  for (const id of invalidDSNPMessageIds) {
    it(`returns false for "${id}"`, () => {
      expect(validateDSNPMessageId(id)).toEqual(false);
    });
  }
});
