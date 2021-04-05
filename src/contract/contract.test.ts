require("dotenv").config();
import Web3 from "web3";
import { getContractAddress } from "./contract";

describe("Contracts", () => {
  describe("getContractAddress", () => {
    it("returns latest address for contract", async () => {
      const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL as string));
      const address = await getContractAddress(web3, "Announcer");
      expect(address).toEqual({
        contractAddress: "0xe7a6467113c2B7f09Aad3b99C30811718A114013",
        contractName: "Announcer",
        blockNumber: 9,
        blockHash: "0x8382d03c95fe0e124c0379bd8622da6f9b36847b9aee4c872bf4fbf03200f1d3",
      });
    });
  });
});
