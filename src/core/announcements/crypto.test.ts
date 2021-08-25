import { randomBytes } from "crypto";
import { ethers } from "ethers";

import { setConfig } from "../../config";
import { createBroadcast } from "./factories";
import { recoverPublicKey, sign } from "./crypto";

const announcement = createBroadcast("1", "https://dsnp.org", "0x12345", BigInt(1627324121352));

describe("announcement crypto", () => {
  describe("#sign", () => {
    beforeAll(async () => {
      const privateKey = "0x6dcefd57d921dc570e198f6bd9dffc32954ab071184c780770cf4541dd23f68e";
      const signer = new ethers.Wallet(privateKey);
      await setConfig({
        signer,
      });
    });

    it("returns a valid signature for a valid private key and announcement", async () => {
      const signedAnnouncement = await sign(announcement);

      expect(signedAnnouncement.signature).toEqual(
        "0xc3ff4a2a135615f03348dc2796fbecb3ecd68c325d0317a7b1a1f026f840f01915a608cf3ae2891b365b6ec0625a9b847b388fad4592fbbdbc36363eb50b40e91b"
      );
    });
  });

  describe("#recoverPublicKey", () => {
    const publicKey = "0x19Fd031833F9d8Bb745F5324d7535DE0FDD3e837";

    it("returns the correct public key for a valid signature", () => {
      const signature =
        "0xc3ff4a2a135615f03348dc2796fbecb3ecd68c325d0317a7b1a1f026f840f01915a608cf3ae2891b365b6ec0625a9b847b388fad4592fbbdbc36363eb50b40e91b";

      expect(recoverPublicKey(announcement, signature)).toEqual(publicKey);
    });

    it("returns a different public key for an invalid signature", () => {
      const signature =
        "0x168aeea67ab8e6b60a8d004ab57e17bab16dac135bcc9d9c8b34058808befd371e5d34ee6b1dc18b3d86e63765352286ba949a39cd458138cad7895b7faca2cb1c";

      expect(recoverPublicKey(announcement, signature)).not.toEqual(publicKey);
    });
  });

  it("round trip signs and verifies announcements", async () => {
    const privateKey = `0x${Buffer.from(randomBytes(32)).toString("hex")}`;
    const signer = new ethers.Wallet(privateKey);
    const address = await signer.getAddress();

    await setConfig({
      signer,
    });

    const signedAnnouncement = await sign(announcement);

    expect(recoverPublicKey(announcement, signedAnnouncement.signature)).toEqual(address);
  });

  it("can build the signature from the spec", async () => {
    const specAnnouncement = {
      announcementType: 1,
      fromId: BigInt(74565),
      contentHash: "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658",
      url: "https://www.dsnp.org/",
      createdAt: BigInt(+new Date("2021-07-31T10:11:12Z")),
    };

    const privateKey = "0xd9d3b5afb7765ffd9f047fd0d1d9b47d4d538b6a56f1cf29dc160ab9c6d30aa3";
    const signer = new ethers.Wallet(privateKey);

    await setConfig({
      signer,
    });

    const signedAnnouncement = await sign(specAnnouncement);

    expect(signedAnnouncement.signature).toEqual(
      "0x2e05b0f769b0344a58a06718f90f5d605878b6d5e9e14e1f235de24b399cfe427135a0b704862a8bc2847c4bb9f78bb43f707d427f0ba19bb43f66d5666934c91c"
    );
    expect(recoverPublicKey(specAnnouncement, signedAnnouncement.signature)).toEqual(
      "0x59DAD64610319200800D7A9b5259B7CbA937cc12"
    );
  });
});
