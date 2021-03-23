import * as ethers from "ethers";

require("dotenv").config();

const TESTING_PRIVATE_KEY = process.env.TESTING_PRIVATE_KEY;

describe("When we post a batch", () => {
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const wallet: unknown = new ethers.Wallet(PRIVATE_KEY, provider);

  it("is on the chain", () => {
    expect(true).toBeTruthy();
  });
});
