import { validateDSNPId } from "./identifiers";

describe("validateDSNPId", () => {
  it("returns true for 'dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'", () => {
    expect(
      validateDSNPId("dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF")
    ).toEqual(true);
  });

  it("returns true for 'dsnp://0123456789abcdef/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'", () => {
    expect(
      validateDSNPId("dsnp://0123456789abcdef/0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef")
    ).toEqual(true);
  });

  it("returns false for 'dsnp://badbadbad/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'", () => {
    expect(validateDSNPId("dsnp://badbadbad/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF")).toEqual(
      false
    );
  });

  it("returns false for 'dsnp://0123456789ABCDEF/badbadbad'", () => {
    expect(validateDSNPId("dsnp://0123456789ABCDEF/badbadbad")).toEqual(false);
  });

  it("returns false for 'dsnp://0123456789ABCDE/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'", () => {
    expect(
      validateDSNPId("dsnp://0123456789ABCDE/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF")
    ).toEqual(false);
  });

  it("returns false for 'dsnp://0123456789ABCDEFA/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF'", () => {
    expect(
      validateDSNPId("dsnp://0123456789ABCDEFA/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF")
    ).toEqual(false);
  });

  it("returns false for 'dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDE'", () => {
    expect(
      validateDSNPId("dsnp://0123456789ABCDEF/0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDE")
    ).toEqual(false);
  });
});