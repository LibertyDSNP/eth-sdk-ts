import { BigNumber, ContractTransaction, Signer } from "ethers";
import { resolveHandle } from "../social/handles";
import { resolveHandleToId, register } from "./registry";
import { Identity__factory, Registry__factory } from "../types/typechain";
import { setupConfig } from "../test/sdkTestConfig";
import { snapshotSetup } from "../test/hardhatRPC";

describe("registry", () => {
  let signer: Signer;

  snapshotSetup();

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

  describe("getRegistrations", () => {
    function hex2a(hex: string) {
      let str = "";
      for (let i = 2; i < hex.length && hex.substr(i, 2) !== "00"; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      return str;
    }

    it("works", async () => {
      const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
      const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract.deployed();
      const handle = "ZebraButtons";
      const identityContractAddress = identityContract.address;
      await register(identityContractAddress, handle);

      const ids = await resolveHandle(handle);
      expect(ids).not.toBeUndefined();
      expect(ids.contractAddr).toEqual(identityContractAddress);

      const regId = parseInt(ids.dsnpId);
      expect(regId).toEqual(1000);
      expect(hex2a(ids.handle)).toEqual(handle);
    });
  });
});

const getIdFromRegisterTransaction = async (transaction: ContractTransaction): Promise<BigNumber> => {
  const receipt = await transaction.wait(1);
  const reg = Registry__factory.createInterface();
  const event = reg.parseLog(receipt.logs[0]);
  return event.args[0];
};
