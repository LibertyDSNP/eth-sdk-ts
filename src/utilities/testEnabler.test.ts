import { DSNP, DSNPMessage } from "../types/DSNP";
import {SEMx25519, WrappedSEM, WrappedSEMxSalsa20} from "../types/SimpleEncryptedFormat";

describe("tests are enabled and types can be used", () => {
  it("enables testing", () => {
    expect(1).toEqual(1);
  });

  it("can use DSNP types", () => {
    const reply: DSNP.Reply = {
      fromAddress: "0xdeadbeef",
      messageID: new Uint8Array(5),
      inReplyTo: new Uint8Array(5),
      uri: "http://www.placekitten.com/400/600",
    };
    const message: DSNPMessage = reply;
    expect(message).not.toBe(undefined);
  });
  it("can use SimpleEncryptedFormat types", () => {
    const semx25519: SEMx25519 = {
      c: "c29tZXRoaW5nIHNvbWV0aGluZw==",
      e: "c29tZSBwdWJsaWMga2V5",
      k: "a2V5IGlkZW50aWZpZXI=",
      n: "MA==",
      v: "x25519-xsalsa20-poly1305",
    };

    const wrappedSEMxSalsa20: WrappedSEMxSalsa20 = {
      c: "c29tZXRoaW5nIHNvbWV0aGluZw==",
      n: "MQ==",
      t: "xsalsa20",
      v: "xsalsa20-poly1305",
      w: [semx25519]
    };

    const wm: WrappedSEM = wrappedSEMxSalsa20
    expect(wm).not.toBe(undefined)
    expect(wm.t).toEqual("xsalsa20")
  });
});
