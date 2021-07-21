import { hash } from "./hash";

describe("hash", () => {
  describe("hash", () => {
    it("returns the correct hash for a given string", () => {
      const content = "blahblahbleh";
      expect(hash(content)).toEqual("0xfff73ac6554d7a545e792200d7058896cefdcf89e10228c251a9539a6868abf0");
    });
  });
});
