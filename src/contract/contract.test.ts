require("dotenv").config();
import Web3 from "web3";
import { getContractAddress } from "./contract";

describe("Contracts", () => {
  describe("getContractAddress", () => {
    it("returns latest address for contract", async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL as string));
      const contractResults = await getContractAddress(web3, "Announcer");
      expect(contractResults.contractName).toEqual("Announcer");
      expect(contractResults).toEqual(
        expect.objectContaining({
          contractAddress: expect.any(String),
          contractName: expect.any(String),
          blockNumber: expect.any(Number),
          blockHash: expect.any(String),
        })
      );
    });
    it("returns empty array if no values found", async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL as string));
      const contractResults = await getContractAddress(web3, "Test");
      expect(contractResults).toEqual({"error": "No longs found for contract name: Test"});
    });
  });
});
