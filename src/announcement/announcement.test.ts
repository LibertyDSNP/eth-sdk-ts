require("dotenv").config();
import * as ethers from "ethers";
import { keccak256 } from "js-sha3";

import { post } from "./announcement";

const TESTING_PRIVATE_KEY = process.env.TESTING_PRIVATE_KEY as string;
const RPC_URL = process.env.RPC_URL;

describe("When we post a batch", () => {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet: ethers.ethers.Signer = new ethers.Wallet(TESTING_PRIVATE_KEY, provider);

  it("is posted successfully", async () => {
    const testUri = "http://www.test.com";
    const hash = keccak256("test");
    const receipt = await post(wallet, testUri, hash);
    expect(receipt).toEqual(
      expect.objectContaining({
        chainId: 1886,
        data:
          "0x7e54d78f9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb65800000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000013687474703a2f2f7777772e746573742e636f6d00000000000000000000000000",
      })
    );
  });
});
