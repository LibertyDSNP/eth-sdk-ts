/* eslint @typescript-eslint/no-var-requires: "off" */
require("dotenv").config();
import { ethers } from "ethers";
import { getContractAddress } from "./contract";
import { snapshotHardhat, revertHardhat } from "../test/hardhatRPC";

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

beforeEach(async () => {
  await snapshotHardhat(provider);
});

afterEach(async () => {
  await revertHardhat(provider);
});

describe("Contracts", () => {
  describe("getContractAddress", () => {
    it("returns latest address for contract", async () => {
      const contractAddress = await getContractAddress(provider, "Announcer");
      expect(contractAddress).not.toBeNull();
    });

    it("returns null if no values found", async () => {
      const contractAddress = await getContractAddress(provider, "Test");
      expect(contractAddress).toBeNull();
    });
  });
});
