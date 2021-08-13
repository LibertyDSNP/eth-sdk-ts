import { hash } from "./hash";
import { hashMessage } from "@ethersproject/hash";
import { concat } from "@ethersproject/bytes";
import { toUtf8Bytes } from "@ethersproject/strings";

describe("hash", () => {
  it("returns the correct hash for a given string", () => {
    const content = "blahblahbleh";
    expect(hash(content)).toEqual("0xfff73ac6554d7a545e792200d7058896cefdcf89e10228c251a9539a6868abf0");
  });

  describe("spec message hash", () => {
    const specMessage =
      "announcementType0x1contentHash0x67890createdAt0x17afc0bd600fromId0x12345urlhttps://www.dsnp.org/";

    const specMessageBytes = concat([
      "0x19",
      toUtf8Bytes("Ethereum Signed Message:\n"),
      toUtf8Bytes(String(specMessage.length)),
      toUtf8Bytes(specMessage),
    ]);

    it("hash message adds all the correct prefixes", () => {
      expect(hashMessage(specMessage)).toEqual("0xe998171b9eedfe13a181aa158c7b2dbb739af9e5ca062cc5822e668be1314478");
    });

    it("converts to Utf8 bytes correctly", () => {
      expect(Buffer.from(specMessageBytes).toString("hex")).toEqual(
        "19457468657265756d205369676e6564204d6573736167653a0a3936616e6e6f756e63656d656e7454797065307831636f6e74656e7448617368307836373839306372656174656441743078313761666330626436303066726f6d49643078313233343575726c68747470733a2f2f7777772e64736e702e6f72672f"
      );
    });

    it("the hashing of the bytes is correct", () => {
      expect(hash(specMessageBytes)).toEqual("0xe998171b9eedfe13a181aa158c7b2dbb739af9e5ca062cc5822e668be1314478");
    });
  });
});
