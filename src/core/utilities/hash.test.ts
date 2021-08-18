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
      "announcementType1contentHash0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658createdAt1627726272000fromId74565urlhttps://www.dsnp.org/";

    const specMessageBytes = concat([
      "0x19",
      toUtf8Bytes("Ethereum Signed Message:\n"),
      toUtf8Bytes(String(specMessage.length)),
      toUtf8Bytes(specMessage),
    ]);

    it("hash message adds all the correct prefixes", () => {
      expect(hashMessage(specMessage)).toEqual("0xabaae4d8fda61c1b9cf481ef784158ebae5cea36f5cb7d1242987553a6dc6aa8");
    });

    it("converts to Utf8 bytes correctly", () => {
      expect(Buffer.from(specMessageBytes).toString("hex")).toEqual(
        "19457468657265756d205369676e6564204d6573736167653a0a313531616e6e6f756e63656d656e745479706531636f6e74656e74486173683078396332326666356632316630623831623131336536336637646236646139346665646566313162323131396234303838623839363634666239613363623635386372656174656441743136323737323632373230303066726f6d4964373435363575726c68747470733a2f2f7777772e64736e702e6f72672f"
      );
    });

    it("the hashing of the bytes is correct", () => {
      expect(hash(specMessageBytes)).toEqual("0xabaae4d8fda61c1b9cf481ef784158ebae5cea36f5cb7d1242987553a6dc6aa8");
    });
  });
});
