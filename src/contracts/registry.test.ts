//eslint-disable-next-line
require("dotenv").config();
import { BigNumber, ContractTransaction, ethers, Signer } from "ethers";

import { snapshotHardhat, revertHardhat } from "../test/hardhatRPC";
import { resolveHandleToId, register } from "./registry";
import { setConfig, getConfig } from "../config/config";
import { Identity__factory, Registry__factory } from "../types/typechain";
import { JsonRpcProvider } from "@ethersproject/providers/src.ts/json-rpc-provider";

const TESTING_PRIVATE_KEY = String(process.env.TESTING_PRIVATE_KEY);
const RPC_URL = String(process.env.RPC_URL);

describe("registry", () => {
  let signer: Signer;
  let provider: JsonRpcProvider;

  beforeAll(async () => {
    provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    signer = new ethers.Wallet(TESTING_PRIVATE_KEY, provider);
    const config = await getConfig();
    config.provider = provider;
    config.signer = signer;
    const registry = await new Registry__factory(signer).deploy();
    await registry.deployed();
    config.contracts.registry = registry.address;
    await setConfig(config);
  });

  beforeEach(async () => {
    // Remember snapshots are used up each time they are reverted to, so beforeEach.
    await snapshotHardhat(provider);
  });

  afterEach(async () => {
    await revertHardhat(provider);
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
  // @ts-expect-error should never be undefined for the test
  return receipt?.events[0]?.args[0] as BigNumber;
};
