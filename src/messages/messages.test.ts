import { ethers } from "ethers";

import { getConfig, setConfig } from "../config/config";
import { createBroadcastMessage, hash, sign, verify, DSNPType } from "./messages";

describe("messages", () => {
  describe("#hash", () => {
    it("returns the same hash for two identical messages", () => {
      const message1 = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
      const message2 = createBroadcastMessage("1", "https://dsnp.org", "0x12345");

      expect(hash(message1)).toEqual(hash(message2));
    });

    it("returns different hashes for two different messages", () => {
      const message1 = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
      const message2 = createBroadcastMessage("2", "https://dsnp.org", "0x12345");

      expect(hash(message1)).not.toEqual(hash(message2));
    });

    it("returns the same hash for two identical messages with different key orders", () => {
      const message1 = {
        contentHash: "0x12345",
        fromId: "1",
        type: DSNPType.Broadcast,
        uri: "https://dsnp.org",
      };
      const message2 = {
        type: DSNPType.Broadcast,
        uri: "https://dsnp.org",
        contentHash: "0x12345",
        fromId: "1",
      };

      expect(hash(message1)).toEqual(hash(message2));
    });
  });

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
        "0x9bde6e79c896768bfeed17e6fb7508d4caca83d01a18e5d14a4428e45d8aced33851595e4234e0d4396a8459109e1eb284583f6745a64289723e41aba1b92a8d1c"
      );
    });
  });

  describe("#verify", () => {
    const publicKey = "0x19Fd031833F9d8Bb745F5324d7535DE0FDD3e837";

    it("returns the correct public key for a valid signature", () => {
      const message = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
      const signature =
        "0x9bde6e79c896768bfeed17e6fb7508d4caca83d01a18e5d14a4428e45d8aced33851595e4234e0d4396a8459109e1eb284583f6745a64289723e41aba1b92a8d1c";

      expect(verify(message, signature)).toEqual(publicKey);
    });

    it("returns a different public key for an invalid signature", () => {
      const message = createBroadcastMessage("1", "https://dsnp.org", "0x12345");
      const signature =
        "0xabde6e79c896768bfeed17e6fb7508d4caca83d01a18e5d14a4428e45d8aced33851595e4234e0d4396a8459109e1eb284583f6745a64289723e41aba1b92a8d1c";

      expect(verify(message, signature)).not.toEqual(publicKey);
    });
  });
});
