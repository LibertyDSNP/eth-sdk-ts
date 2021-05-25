//eslint-disable-next-line
require("dotenv").config();
import {ContractReceipt, ethers} from "ethers";

import { snapshotHardhat, revertHardhat } from "../test/hardhatRPC";
import { setConfig, getConfig } from "../config/config";
import { createCloneProxy, createCloneProxyWithOwner } from "./identity";
const TESTING_PRIVATE_KEY = String(process.env.TESTING_PRIVATE_KEY);
const RPC_URL = String(process.env.RPC_URL);
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(TESTING_PRIVATE_KEY, provider);

const owner = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

beforeEach(async () => {
  const config = await getConfig();
  config.provider = provider;
  config.signer = signer;
  await setConfig(config);

  await snapshotHardhat(provider);
});

afterEach(async () => {
  await revertHardhat(provider);
});

describe("identity", () => {
  describe("createCloneProxy", () => {
    it("creates a proxy contract", async () => {
      const proxyReceipt: ContractReceipt = await (await createCloneProxy()).wait() as ContractReceipt;
      const proxyContractEvents = proxyReceipt && proxyReceipt.events && proxyReceipt ? proxyReceipt.events.filter((event) => { return event.event === "ProxyCreated"}) : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
      console.log("contractAddress", contractAddress);
      await expect((await createCloneProxy()).wait()).resolves.not.toBeNull();
    });
  });

  describe("createCloneProxy with owner", () => {
    it("creates a proxy contract", async () => {
      const proxyReceipt: ContractReceipt = await (await createCloneProxyWithOwner(owner)).wait() as ContractReceipt;
      const proxyContractEvents = proxyReceipt && proxyReceipt.events && proxyReceipt ? proxyReceipt.events.filter((event) => { return event.event === "ProxyCreated"}) : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
      console.log("contractAddress", contractAddress);
      await expect((await createCloneProxy()).wait()).resolves.not.toBeNull();
    });
  });
});
