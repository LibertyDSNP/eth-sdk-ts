//eslint-disable-next-line
require("dotenv").config();
import Web3 from "web3";
import { keccak256 } from "js-sha3";

import { batch } from "./announcement";
import { EthereumAddress } from "../types/Strings";

const TESTING_PRIVATE_KEY = String(process.env.TESTING_PRIVATE_KEY);
const RPC_URL = String(process.env.RPC_URL);

describe("#batch", () => {
  const web3 = new Web3();
  const provider = new Web3.providers.HttpProvider(RPC_URL);
  web3.setProvider(provider);
  const account = web3.eth.accounts.privateKeyToAccount(TESTING_PRIVATE_KEY);
  web3.eth.accounts.wallet.add(account);

  it("successfully posts a batch to the chain", async () => {
    jest.setTimeout(12000);
    const testUri = "http://www.testconst.com";
    const hash = keccak256("test");
    const receipt = await batch(web3, account.address as EthereumAddress, testUri, hash);
    expect(receipt).toEqual(
      expect.objectContaining({
        events: expect.objectContaining({
          DSNPBatch: expect.objectContaining({
            event: "DSNPBatch",
            raw: expect.objectContaining({
              data:
                "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb65800000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000018687474703a2f2f7777772e74657374636f6e73742e636f6d0000000000000000",
              topics: ["0x05b15401a1cdc64b82f68754db0847c6b6ab8900804fe703c6d30a73e9f00e7b"],
            }),
            returnValues: expect.objectContaining({
              "0": "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658",
              "1": "http://www.testconst.com",
              dsnpUri: "http://www.testconst.com",
              hash: "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658",
            }),
            type: "mined",
          }),
        }),
      })
    );
  });
});
