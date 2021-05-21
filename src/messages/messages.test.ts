import { ethers } from "ethers";

import { getConfig, setConfig } from "../config/config";
import { createBroadcastMessage, sign, recoverPublcKey } from "./messages";

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
        "0x168aeea67ab8e6b60a8d004ab57e17bab16dac135bcc9d9c8b34058808befd371e4d34ee6b1dc18b3d86e63765352286ba949a39cd458138cad7895b7faca2cb1c"
      );
    });
  });

  describe("#recoverPublcKey", () => {
    const publicKey = "0x19Fd031833F9d8Bb745F5324d7535DE0FDD3e837";

    it("returns the correct public key for a valid signature", () => {
      const message = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
      const signature =
        "0x168aeea67ab8e6b60a8d004ab57e17bab16dac135bcc9d9c8b34058808befd371e4d34ee6b1dc18b3d86e63765352286ba949a39cd458138cad7895b7faca2cb1c";

      expect(recoverPublcKey(message, signature)).toEqual(publicKey);
    });

    it("returns a different public key for an invalid signature", () => {
      const message = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
      const signature =
        "0x168aeea67ab8e6b60a8d004ab57e17bab16dac135bcc9d9c8b34058808befd371e5d34ee6b1dc18b3d86e63765352286ba949a39cd458138cad7895b7faca2cb1c";

      expect(recoverPublcKey(message, signature)).not.toEqual(publicKey);
    });
  });
});
