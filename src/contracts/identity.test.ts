//eslint-disable-next-line
require("dotenv").config();
import { ContractReceipt, ethers } from "ethers";

import { snapshotHardhat, revertHardhat } from "../test/hardhatRPC";
import { setConfig, getConfig } from "../config/config";
import { createCloneProxy, createCloneProxyWithOwner } from "./identity";
const TESTING_PRIVATE_KEY = String(process.env.TESTING_PRIVATE_KEY);
const RPC_URL = String(process.env.RPC_URL);
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(TESTING_PRIVATE_KEY, provider);

const owner = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";

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
      const proxyReceipt: ContractReceipt = (await (await createCloneProxy()).wait()) as ContractReceipt;
      console.log("prooxyReceipt1", proxyReceipt);
      const proxyContractEvents =
        proxyReceipt && proxyReceipt.events
          ? proxyReceipt.events.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;

      await expect((await createCloneProxy()).wait()).resolves.not.toBeNull();
      expect(contractAddress).toEqual("0x3B02fF1e626Ed7a8fd6eC5299e2C54e1421B626B");
    });
  });

  describe("createCloneProxy with owner", () => {
    it("creates a proxy contract", async () => {
      const proxyReceipt: ContractReceipt = (await (await createCloneProxyWithOwner(owner)).wait()) as ContractReceipt;
      console.log("proxyReceipt2", proxyReceipt);
      const proxyContractEvents =
        proxyReceipt && proxyReceipt.events && proxyReceipt
          ? proxyReceipt.events.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
      await expect((await createCloneProxy()).wait()).resolves.not.toBeNull();
      expect(contractAddress).toEqual("0x3B02fF1e626Ed7a8fd6eC5299e2C54e1421B626B");
    });

    // it("expect is authorized to to return true for owner", async () => {
    //   const proxyReceipt: ContractReceipt = (await (await createCloneProxyWithOwner(owner)).wait()) as ContractReceipt;
    //   console.log("proxyReceipt2", proxyReceipt);
    //   const proxyContractEvents =
    //     proxyReceipt && proxyReceipt.events && proxyReceipt
    //       ? proxyReceipt.events.filter((event) => {
    //         return event.event === "ProxyCreated";
    //       })
    //       : [];
    //   const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
    // });
    //
    // it("expect is authorized to to return false for non owner", async () => {
    //   const proxyReceipt: ContractReceipt = (await (await createCloneProxyWithOwner(owner)).wait()) as ContractReceipt;
    //   console.log("proxyReceipt2", proxyReceipt);
    //   const proxyContractEvents =
    //     proxyReceipt && proxyReceipt.events && proxyReceipt
    //       ? proxyReceipt.events.filter((event) => {
    //         return event.event === "ProxyCreated";
    //       })
    //       : [];
    //   const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
    // });
  });
});
