require("dotenv").config();
import Web3 from "web3";
import { keccak256 } from "js-sha3";

import { post } from "./announcement";

const TESTING_PRIVATE_KEY = process.env.TESTING_PRIVATE_KEY as string;
const RPC_URL = process.env.RPC_URL as string;

describe("When we post a batch", () => {
  const web3 = new Web3();
  const provider = new Web3.providers.WebsocketProvider(RPC_URL);
  web3.setProvider(provider);
  const account = web3.eth.accounts.privateKeyToAccount(TESTING_PRIVATE_KEY);

  it("is posted successfully", async () => {
    const testUri = "http://www.test.com";
    const hash = keccak256("test");
    const receipt = await post(web3, account, testUri, hash);
    expect(receipt).toEqual(
      expect.objectContaining({
        chainId: 1886,
        data:
          "0x7e54d78f9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb65800000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000013687474703a2f2f7777772e746573742e636f6d00000000000000000000000000",
      })
    );
  });
});