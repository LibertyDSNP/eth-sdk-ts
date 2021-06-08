import { BigNumber, Signer } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";
import { revertHardhat, snapshotHardhat, snapshotSetup } from "../../test/hardhatRPC";
import {
  changeAddress,
  changeHandle,
  getDSNPRegistryUpdateEvents,
  register,
  resolveRegistration,
  validateMessage,
} from "./registry";
import { Identity__factory } from "../../types/typechain";
import { setupConfig } from "../../test/sdkTestConfig";
import { Permission } from "./identity";
import { DSNPMessage, sign } from "../messages";
import { generateBroadcast } from "../../test/generators/dsnpGenerators";
import {
  getIdFromRegisterTransaction,
  newRegistrationForAccountIndex,
  RegistrationWithSigner,
} from "../../test/testAccounts";
import { generateHexString } from "@dsnp/test-generators";

describe("registry", () => {
  let signer: Signer;
  let provider: JsonRpcProvider;

  snapshotSetup();

  beforeAll(() => {
    ({ signer, provider } = setupConfig());
  });

  describe("#resolveRegistration", () => {
    const handle = "registered";
    let givenId: BigNumber;

    beforeAll(async () => {
      await snapshotHardhat(provider);
      const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
      const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract.deployed();
      const transaction = await register(identityContract.address, handle);
      givenId = await getIdFromRegisterTransaction(transaction);
    });

    afterAll(async () => {
      await revertHardhat(provider);
    });

    it("Returns the correct id", async () => {
      expect(givenId.toHexString()).toEqual("0x03e8");
      const result = await resolveRegistration(handle);

      expect(result?.dsnpId).toEqual(givenId.toHexString());
    });

    it("Returns null for an unfound handle", async () => {
      const result = await resolveRegistration("not-registered");
      expect(result).toBeNull();
    });
  });

  describe("#register", () => {
    const handle = "registered";
    const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
    let idContractAddr = "";

    beforeAll(async () => {
      await snapshotHardhat(provider);
      const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract.deployed();
      idContractAddr = identityContract.address;
      await register(identityContract.address, handle);
    });

    afterAll(async () => {
      await revertHardhat(provider);
    });

    it("Should throw for an already registered handle", async () => {
      // Second time for handle
      const pendingTx = register(idContractAddr, handle);
      await expect(pendingTx).transactionRejectsWith(/Handle already exists/);
    });

    it("returns a Contract Transaction that can be resolved into a DSNP Id", async () => {
      const transaction = await register(idContractAddr, "new-handle");

      expect((await getIdFromRegisterTransaction(transaction)).toHexString()).toEqual("0x03e9"); // 1001
    });
  });

  describe("#changeHandle", () => {
    const handle = "registered";
    let idContractAddr = "";

    beforeAll(async () => {
      await snapshotHardhat(provider);
      const identityContract = await new Identity__factory(signer).deploy(await signer.getAddress());
      await identityContract.deployed();
      idContractAddr = identityContract.address;
      await register(identityContract.address, handle);
    });

    afterAll(async () => {
      await revertHardhat(provider);
    });

    it("Should succeed with an unregistered handle", async () => {
      const otherHandle = "completely new";
      const pendingTx = changeHandle(handle, otherHandle);
      await expect(pendingTx).resolves.toBeTruthy();
    });

    it("Should throw for the same handle", async () => {
      const pendingTx = changeHandle(handle, handle);
      await expect(pendingTx).transactionRejectsWith(/New handle already exists/);
    });

    it("Should throw for an already registered handle", async () => {
      const otherHandle = "reg2";
      await register(idContractAddr, otherHandle);

      const pendingTx = changeHandle(handle, otherHandle);
      await expect(pendingTx).transactionRejectsWith(/New handle already exists/);
    });

    it("returns a Contract Transaction with the DSNPRegistryUpdate Event", async () => {
      const otherHandle = "completely new";
      const contractTransaction = await changeHandle(handle, otherHandle);
      const receipt = await contractTransaction.wait();

      expect(receipt.events).toHaveLength(1);
      expect(receipt.events?.[0]?.event).toEqual("DSNPRegistryUpdate");
    });
  });

  describe("#changeAddress", () => {
    const handle = "registered";
    let newIdContractAddr = "";

    beforeAll(async () => {
      await snapshotHardhat(provider);
      const identityContract = await new Identity__factory(signer).deploy(await signer.getAddress());
      await identityContract.deployed();
      await register(identityContract.address, handle);

      const newIdentityContract = await new Identity__factory(signer).deploy(await signer.getAddress());
      await newIdentityContract.deployed();
      newIdContractAddr = newIdentityContract.address;
    });

    afterAll(async () => {
      await revertHardhat(provider);
    });

    it("Should succeed", async () => {
      const pendingTx = changeAddress(handle, newIdContractAddr);
      await expect(pendingTx).resolves.toBeTruthy();
    });

    it("Should reject for a non-contract address", async () => {
      const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
      const pendingTx = changeAddress(handle, fakeAddress);
      await expect(pendingTx).rejects.toBeTruthy();
    });

    it("returns a Contract Transaction with the DSNPRegistryUpdate Event", async () => {
      const contractTransaction = await changeAddress(handle, newIdContractAddr);
      const receipt = await contractTransaction.wait();

      expect(receipt.events).toHaveLength(1);
      expect(receipt.events?.[0]?.event).toEqual("DSNPRegistryUpdate");
    });
  });

  describe("getDSNPRegistryUpdateEvents", () => {
    it("can pull one event", async () => {
      const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
      const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract.deployed();
      const handle = "ZebraButtons";
      const identityContractAddress = identityContract.address;
      await register(identityContractAddress, handle);

      const regs = await getDSNPRegistryUpdateEvents({ contractAddr: identityContractAddress });
      expect(regs[0].contractAddr).toEqual(identityContractAddress);

      expect(regs[0].dsnpId).toEqual("0x0" + Number(1000).toString(16));
      expect(regs[0].handle).toEqual(handle);
    });

    it("Does not pull other almost matching events", async () => {
      const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
      const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract.deployed();
      const identityContract2 = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract2.deployed();
      const handle = "ZebraButtons";
      await register(identityContract.address, handle);
      await register(identityContract2.address, handle + "2");

      const regs = await getDSNPRegistryUpdateEvents({ contractAddr: identityContract.address });
      expect(regs).toHaveLength(1);
      expect(regs[0].contractAddr).toEqual(identityContract.address);
      expect(regs[0].handle).toEqual(handle);
    });

    it("pulls all the related events for identityContract", async () => {
      const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
      const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
      await identityContract.deployed();
      const handle = "ZebraButtons";
      const identityContractAddress = identityContract.address;
      await register(identityContractAddress, handle);
      await register(identityContractAddress, handle + "2");

      const regs = await getDSNPRegistryUpdateEvents({ contractAddr: identityContractAddress });
      expect(regs).toHaveLength(2);
      expect(regs[0].handle).toEqual(handle);
      expect(regs[1].handle).toEqual(handle + "2");
    });

    it("pulls all the related events for matching ids in the correct order", async () => {
      const identityContract = await new Identity__factory(signer).deploy(await signer.getAddress());
      await identityContract.deployed();
      const handle = "ZebraButtons";
      const identityContractAddress = identityContract.address;
      const tx = await register(identityContractAddress, handle);
      const id = await getIdFromRegisterTransaction(tx);
      await changeHandle(handle, handle + "new");

      const regs = await getDSNPRegistryUpdateEvents({ dsnpId: id });
      expect(regs).toHaveLength(2);
      expect(regs[0].handle).toEqual(handle);
      expect(regs[1].handle).toEqual(handle + "new");
    });
  });

  describe("validateMessage", () => {
    const msg: DSNPMessage = generateBroadcast();

    const permAllowed = Permission.ANNOUNCE;
    const permDenied = Permission.OWNERSHIP_TRANSFER;
    let contractAddr = "";
    let sig = "";
    let dsnpId = "";
    let signerAddr = "";

    beforeAll(async () => {
      await snapshotHardhat(provider);
      signerAddr = await signer.getAddress();
      const identityContract = await new Identity__factory(signer).deploy(signerAddr);
      await identityContract.deployed();
      contractAddr = identityContract.address;
      const tx = await register(contractAddr, "Animaniacs");
      dsnpId = await getIdFromRegisterTransaction(tx);
      sig = await sign(msg);
    });

    afterAll(async () => {
      await revertHardhat(provider);
    });

    it("returns true if the signer is authorized for the given permissions", async () => {
      await expect(validateMessage(sig, msg, dsnpId.toString(), permAllowed)).toBeTruthy();
    });

    it("returns false if the signer is not authorized for the given permissions", async () => {
      const regSigner: RegistrationWithSigner = await newRegistrationForAccountIndex(19, "Handel");
      const res = await validateMessage(sig, msg, regSigner.dsnpId.toString(), permDenied);
      expect(res).toBeFalsy();
    });

    it("returns false if signature is a real one but not for this message", async () => {
      const otherMsg = generateBroadcast();
      const badSig = await sign(otherMsg);
      const res = await validateMessage(badSig, msg, dsnpId.toString(), permAllowed);
      expect(res).toBeFalsy();
    });

    it("accepts a block number", async () => {
      await expect(validateMessage(sig, msg, dsnpId.toString(), permAllowed, 1)).toBeTruthy();
    });

    it("throws if id cannot be resolved", async () => {
      await expect(validateMessage("0xdeadbeef", msg, "0xabcd1234", permAllowed)).rejects.toThrow(
        "Contract was not found"
      );
    });
    it("throws if block number cannot be retrieved", async () => {
      await expect(validateMessage(sig, msg, dsnpId.toString(), permAllowed, 99999)).rejects.toThrow(
        "could not get block at height 99999"
      );
    });
    it("throws if signature is garbage", async () => {
      const badSig = generateHexString(65);
      await expect(validateMessage(badSig, msg, dsnpId.toString(), permAllowed)).rejects.toThrow(
        /signature missing v and recoveryParam/
      );
    });
  });
});
