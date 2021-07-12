import { randomBytes } from "crypto";
import { ethers } from "ethers";

import { getConfig, setConfig } from "../../config";
import { createBroadcastMessage, serialize, sign, recoverPublicKey } from "./messages";

describe("messages", () => {
  describe("#serialize", () => {
    it("returns the correct serialization for a given message", async () => {
      const message = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
      const serializedMessage = await serialize(message);

      expect(serializedMessage).toEqual("contentHash0x12345dsnpType2fromId1urlhttps://dsnp.org");
    });
  });

  describe("#sign", () => {
    beforeAll(async () => {
      const privateKey = "0x6dcefd57d921dc570e198f6bd9dffc32954ab071184c780770cf4541dd23f68e";
      await setConfig({
        ...getConfig(),
        signer: new ethers.Wallet(privateKey),
      });
    });

    it("returns a valid signature for a valid private key and message", async () => {
      const message = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
      const signedMessage = await sign(message);

      expect(signedMessage.signature).toEqual(
        "0xdfd1e58a5947e98aa5aa0276e8b0c54bc3cc433ae588d1844755624e33a55cb430f221ae090ac73e890eab9d244c7eebc6b23c76a05e1353c4a7b530a322048c1b"
      );
    });
  });

  describe("#recoverPublicKey", () => {
    const publicKey = "0x7794b74C1173AAC399e542c74390b3981d92835A";

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
      ...getConfig(),
      signer,
    });

    const signedMessage = await sign(message);

    expect(recoverPublicKey(message, signedMessage.signature)).toEqual(address);
  });
});
