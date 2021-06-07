import { randomBytes } from "crypto";
import { ethers } from "ethers";

import { getConfig, setConfig } from "../../config";
import { createBroadcastMessage, sign, recoverPublicKey } from "./messages";

describe("messages", () => {
  describe("#sign", () => {
    beforeAll(async () => {
      const privateKey = "0x6dcefd57d921dc570e198f6bd9dffc32954ab071184c780770cf4541dd23f68e";
      await setConfig({
        ...(await getConfig()),
        signer: new ethers.Wallet(privateKey),
      });
    });

    it("returns a valid signature for a valid private key and message", async () => {
      const message = createBroadcastMessage("1", "https://dsnp.org", "0x12345");

      expect(await sign(message)).toEqual(
        "0xd33f14693809e6c7bcd5148cb585a63ce51d54bd229a7306dab22d3437b001140538494c1b7b19a2a806bcc6da26fc205b237cfe4a60dd738d994ec72e2a6a561c"
      );
    });
  });

  describe("#recoverPublicKey", () => {
    const publicKey = "0x19Fd031833F9d8Bb745F5324d7535DE0FDD3e837";

    it("returns the correct public key for a valid signature", () => {
      const message = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
      const signature =
        "0xd33f14693809e6c7bcd5148cb585a63ce51d54bd229a7306dab22d3437b001140538494c1b7b19a2a806bcc6da26fc205b237cfe4a60dd738d994ec72e2a6a561c";

      expect(recoverPublicKey(message, signature)).toEqual(publicKey);
    });

    it("returns a different public key for an invalid signature", () => {
      const message = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
      const signature =
        "0x168aeea67ab8e6b60a8d004ab57e17bab16dac135bcc9d9c8b34058808befd371e5d34ee6b1dc18b3d86e63765352286ba949a39cd458138cad7895b7faca2cb1c";

      expect(recoverPublicKey(message, signature)).not.toEqual(publicKey);
    });
  });

  it("round trip signs and verifies messages", async () => {
    const message = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
    const privateKey = `0x${Buffer.from(randomBytes(32)).toString("hex")}`;
    const signer = new ethers.Wallet(privateKey);
    const address = await signer.getAddress();

    await setConfig({
      ...(await getConfig()),
      signer,
    });

    const signature = await sign(message);

    expect(recoverPublicKey(message, signature)).toEqual(address);
  });
});
