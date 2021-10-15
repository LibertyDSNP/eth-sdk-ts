import { getRandomString } from "./random";

describe("random", () => {
  describe("getRandomString", () => {
    it("returns a string of the given length", () => {
      const str = getRandomString(10);

      expect(str.length).toEqual(10);
    });

    it("returns a string of length 32 when no length is provided", () => {
      const str = getRandomString();

      expect(str.length).toEqual(32);
    });

    it("never returns non-alphanumeric characters", () => {
      const alpha = "abcdefghijklmnopqrstuvwxyz0123456789";
      const str = getRandomString();

      for (let i = 0; i < str.length; i++) {
        expect(alpha).toContain(str[i]);
      }
    });
  });
});
