import { BigNumber, ContractTransaction, Signer } from "ethers";
import { resolveHandleToId, register } from "./registry";
import { Identity__factory, Registry__factory } from "../types/typechain";
import { setupConfig } from "../test/sdkTestConfig";

describe("registry", () => {
  let signer: Signer;

  beforeAll(() => {
    ({ signer } = setupConfig());
  });

  describe("#resolveHandleToId", () => {
    const handle = "registered";
    let givenId: BigNumber;
    beforeEach(async () => {
      const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
      const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract.deployed();
      const transaction = await register(identityContract.address, handle);
      givenId = await getIdFromRegisterTransaction(transaction);
    });

    it("Returns the correct id", async () => {
      expect(givenId.toHexString()).toEqual("0x03e8");
      const result = await resolveHandleToId(handle);

      expect(result).toEqual(givenId.toHexString());
    });

    it("Returns null for an unfound handle", async () => {
      const result = await resolveHandleToId("not-registered");
      expect(result).toBeNull();
    });
  });

  describe("#register", () => {
    const handle = "registered";
    const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
    let idContractAddr = "";

    beforeEach(async () => {
      const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract.deployed();
      idContractAddr = identityContract.address;
      await register(identityContract.address, handle);
    });

    it("Should throw for an already registered handle", async () => {
      // Second time for handle
      const pendingTx = register(idContractAddr, handle);
      await expect(pendingTx).rejects.toBeTruthy();
    });

    it("returns a Contract Transaction that can be resolved into a DSNP Id", async () => {
      const transaction = await register(idContractAddr, "new-handle");

      expect((await getIdFromRegisterTransaction(transaction)).toHexString()).toEqual("0x03e9"); // 1001
    });
  });
});

const getIdFromRegisterTransaction = async (transaction: ContractTransaction): Promise<BigNumber> => {
  const receipt = await transaction.wait(1);
  const reg = Registry__factory.createInterface();
  const event = reg.parseLog(receipt.logs[0]);
  return event.args[0];
};
