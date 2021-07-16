import { randomBytes } from "crypto";
import { ethers } from "ethers";

import { getConfig, setConfig } from "../../config";
import { createBroadcast } from "./factories";
import { recoverPublicKey, sign } from "./crypto";

describe("announcement crypto", () => {
  describe("#sign", () => {
    beforeAll(async () => {
      const privateKey = "0x6dcefd57d921dc570e198f6bd9dffc32954ab071184c780770cf4541dd23f68e";
      await setConfig({
        ...getConfig(),
        signer: new ethers.Wallet(privateKey),
      });
    });

    it("returns a valid signature for a valid private key and announcement", async () => {
      const announcement = createBroadcast("1", "https://dsnp.org", "0x12345");
      const signedAnnouncement = await sign(announcement);

      expect(signedAnnouncement.signature).toEqual(
        "0x66e9b316924dfd6b36fcc3572e9aec6dd76b66066dd892299a20b992865f71736a7ce823af3f6adbdf4d176613b33bb41a707ed1fb3bf0b821e33a34acd30c0a1c"
      );
    });
  });

  describe("#recoverPublicKey", () => {
    const publicKey = "0xC1e8c5325664679bb6D4A31F4980f15349BE224C";

    it("returns the correct public key for a valid signature", () => {
      const announcement = createBroadcast("1", "https://dsnp.org", "0x12345");
      const signature =
        "0xd33f14693809e6c7bcd5148cb585a63ce51d54bd229a7306dab22d3437b001140538494c1b7b19a2a806bcc6da26fc205b237cfe4a60dd738d994ec72e2a6a561c";

      expect(recoverPublicKey(announcement, signature)).toEqual(publicKey);
    });

    it("returns a different public key for an invalid signature", () => {
      const announcement = createBroadcast("1", "https://dsnp.org", "0x12345");
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
      ...getConfig(),
      signer,
    });

    const signedAnnouncement = await sign(announcement);

    expect(recoverPublicKey(announcement, signedAnnouncement.signature)).toEqual(address);
  });
});
