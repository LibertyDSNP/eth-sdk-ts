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
        "0xc3ff4a2a135615f03348dc2796fbecb3ecd68c325d0317a7b1a1f026f840f01915a608cf3ae2891b365b6ec0625a9b847b388fad4592fbbdbc36363eb50b40e91b"
      );
    });
  });

  describe("#recoverPublicKey", () => {
    const publicKey = "0x09A60F4A599d80e5dE935FE96c150eF24912D03f";

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
});
