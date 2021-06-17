import { getContractAddress } from "./contract";
import { ethers } from "ethers";
import { setupConfig } from "../../test/sdkTestConfig";
import { setupSnapshot } from "../../test/hardhatRPC";

describe("Contracts", () => {
  setupSnapshot();
  let provider: ethers.providers.JsonRpcProvider;
  beforeAll(async () => {
    ({ provider } = setupConfig());
  });

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
