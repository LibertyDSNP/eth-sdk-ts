import { randomBytes } from "crypto";
import { ethers } from "ethers";

import { setConfig } from "../../config";
import { createBroadcast } from "./factories";
import { recoverPublicKey, sign } from "./crypto";

describe("announcement crypto", () => {
  describe("#sign", () => {
    beforeAll(async () => {
      const privateKey = "0x6dcefd57d921dc570e198f6bd9dffc32954ab071184c780770cf4541dd23f68e";
      await setConfig({
        signer: new ethers.Wallet(privateKey),
      });
    });

    it("returns a valid signature for a valid private key and announcement", async () => {
      const announcement = createBroadcast("1", "https://dsnp.org", "0x12345", 1627324121352);
      const signedAnnouncement = await sign(announcement);

      expect(signedAnnouncement.signature).toEqual(
        "0x64cd1aaad7c54106c2ae58f3f5659f274e0dc212f1afc6975dbe4b5ae3b19bef414ca618014e10ea07f609aab3a40cffc89dd03e11f04a73f26aa6f1376464981b"
      );
    });
  });

  describe("#recoverPublicKey", () => {
    const publicKey = "0x307FBB8320C719B7A4Cd1F9215d8927C28066583";

    it("returns the correct public key for a valid signature", () => {
      const announcement = createBroadcast("1", "https://dsnp.org", "0x12345", 1627324121352);
      const signature =
        "0xd33f14693809e6c7bcd5148cb585a63ce51d54bd229a7306dab22d3437b001140538494c1b7b19a2a806bcc6da26fc205b237cfe4a60dd738d994ec72e2a6a561c";

      expect(recoverPublicKey(announcement, signature)).toEqual(publicKey);
    });

    it("returns a different public key for an invalid signature", () => {
      const announcement = createBroadcast("1", "https://dsnp.org", "0x12345", 1627324121352);
      const signature =
        "0x168aeea67ab8e6b60a8d004ab57e17bab16dac135bcc9d9c8b34058808befd371e5d34ee6b1dc18b3d86e63765352286ba949a39cd458138cad7895b7faca2cb1c";

      expect(recoverPublicKey(announcement, signature)).not.toEqual(publicKey);
    });
  });

  it("round trip signs and verifies announcements", async () => {
    const announcement = createBroadcast("1", "https://dsnp.org", "0x12345");
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
      fromId: "0x12345",
      contentHash: "0x67890",
      url: "https://www.dsnp.org/",
      createdAt: +new Date("2021-07-31T10:11:12"),
    };

    const privateKey = "0xd9d3b5afb7765ffd9f047fd0d1d9b47d4d538b6a56f1cf29dc160ab9c6d30aa3";
    const signer = new ethers.Wallet(privateKey);

    await setConfig({
      signer,
    });

    const signedAnnouncement = await sign(specAnnouncement);

    expect(signedAnnouncement.signature).toEqual(
      "0xa34e5f6ba5f133cc1c8dfed613ad913f07dc5dff38c92278f9253c07ff43bd1d3f86a862db3db7223a2d2b530dd15cbdc450fb2394917f1f413f4a102822deca1c"
    );
    expect(recoverPublicKey(specAnnouncement, signedAnnouncement.signature)).toEqual(
      "0x59DAD64610319200800D7A9b5259B7CbA937cc12"
    );
  });
});
