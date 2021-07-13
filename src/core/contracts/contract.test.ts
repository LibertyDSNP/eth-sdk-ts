import { ethers } from "ethers";

import { ContractName } from "../../config";
import { getContractAddress } from "./contract";
import { MissingContractAddressError } from "./contractErrors";
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
      const contractAddress = await getContractAddress(provider, "Publisher");
      expect(contractAddress).not.toBeNull();
    });

    it("throws MissingContractAddressError if no values found", async () => {
      await expect(getContractAddress(provider, "Test" as ContractName)).rejects.toThrow(MissingContractAddressError);
    });
  });
});
