import { hexToUint8Array, uint8ArrayToHex } from "./buffers";

describe("buffers", () => {
  describe("hexToUint8Array", () => {
    it("returns the correct Uint8Array", () => {
      expect(hexToUint8Array("0x0123")).toEqual(new Uint8Array([1, 35]));
      expect(hexToUint8Array("0x000000abcd")).toEqual(new Uint8Array([0, 0, 0, 171, 205]));
    });
  });

  describe("uint8ArrayToHex", () => {
    it("returns the correct Uint8Array", () => {
      expect(uint8ArrayToHex(new Uint8Array([1, 35]))).toEqual("0x0123");
      expect(uint8ArrayToHex(new Uint8Array([0, 0, 0, 171, 205]))).toEqual("0x000000abcd");
    });
  });
});
