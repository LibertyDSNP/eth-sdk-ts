//eslint-disable-next-line
require("dotenv").config();
import { ContractReceipt, ethers } from "ethers";

import { snapshotHardhat, revertHardhat } from "../test/hardhatRPC";
import { setConfig, getConfig } from "../config/config";
import {
  createCloneProxy,
  createCloneProxyWithOwner,
  createBeaconProxy,
  createBeaconProxyWithOwner,
  isAuthorizedTo,
  Permission,
} from "./identity";
const TESTING_PRIVATE_KEY = String(process.env.TESTING_PRIVATE_KEY);
const RPC_URL = String(process.env.RPC_URL);
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(TESTING_PRIVATE_KEY, provider);

const owner = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
const nonOwner = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc";
const beacon = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

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
      const proxyContractEvents =
        proxyReceipt && proxyReceipt.events
          ? proxyReceipt?.events?.filter((event) => {
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

    it("expect is authorized to to return true for owner", async () => {
      const proxyReceipt: ContractReceipt = (await (await createCloneProxyWithOwner(owner)).wait()) as ContractReceipt;
      const proxyContractEvents =
        proxyReceipt && proxyReceipt.events && proxyReceipt
          ? proxyReceipt.events.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
      const authorized = await isAuthorizedTo(owner, contractAddress, Permission.ANNOUNCE, 0);
      expect(authorized).toBe(true);
    });
    //
    it("expect is authorized to to return false for non owner", async () => {
      const proxyReceipt: ContractReceipt = (await (await createCloneProxyWithOwner(owner)).wait()) as ContractReceipt;
      const proxyContractEvents =
        proxyReceipt && proxyReceipt.events && proxyReceipt
          ? proxyReceipt.events.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
      const authorized = await isAuthorizedTo(nonOwner, contractAddress, Permission.ANNOUNCE, 0);
      expect(authorized).toBe(false);
    });
  });

  describe("createBeaconProxy", () => {
    it("creates a beacon proxy contract", async () => {
      const proxyReceipt: ContractReceipt = (await (await createBeaconProxy()).wait()) as ContractReceipt;
      const proxyContractEvents =
        proxyReceipt && proxyReceipt.events
          ? proxyReceipt?.events?.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;

      await expect((await createBeaconProxy()).wait()).resolves.not.toBeNull();
      expect(contractAddress).toEqual("0x8aCd85898458400f7Db866d53FCFF6f0D49741FF");
    });

    it("creates a beacon proxy contract pointing to a beacon proxy contract", async () => {
      const proxyReceipt: ContractReceipt = (await (await createBeaconProxy(beacon)).wait()) as ContractReceipt;
      const proxyContractEvents =
        proxyReceipt && proxyReceipt.events
          ? proxyReceipt?.events?.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;

      await expect((await createBeaconProxy(beacon)).wait()).resolves.not.toBeNull();
      expect(contractAddress).toEqual("0x8aCd85898458400f7Db866d53FCFF6f0D49741FF");
    });
  });

  describe("createBeaconProxyWithOwner", () => {
    it("creates a beacon proxy contract", async () => {
      const proxyReceipt: ContractReceipt = (await (
        await createBeaconProxyWithOwner(owner, beacon)
      ).wait()) as ContractReceipt;
      const proxyContractEvents =
        proxyReceipt && proxyReceipt.events
          ? proxyReceipt?.events?.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;

      await expect((await createBeaconProxyWithOwner(owner, beacon)).wait()).resolves.not.toBeNull();
      expect(contractAddress).toEqual("0x8aCd85898458400f7Db866d53FCFF6f0D49741FF");
    });

    it("expect is authorized to to return false or nonOwner", async () => {
      const proxyReceipt: ContractReceipt = (await (
        await createBeaconProxyWithOwner(owner, beacon)
      ).wait()) as ContractReceipt;
      const proxyContractEvents =
        proxyReceipt && proxyReceipt.events && proxyReceipt
          ? proxyReceipt.events.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
      const authorized = await isAuthorizedTo(nonOwner, contractAddress, Permission.ANNOUNCE, 0);
      expect(authorized).toBe(false);
    });

    it("expect is authorized to to return true for owner", async () => {
      const proxyReceipt: ContractReceipt = (await (
        await createBeaconProxyWithOwner(owner, beacon)
      ).wait()) as ContractReceipt;
      const proxyContractEvents =
        proxyReceipt && proxyReceipt.events && proxyReceipt
          ? proxyReceipt.events.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
      const authorized = await isAuthorizedTo(owner, contractAddress, Permission.ANNOUNCE, 0);
      expect(authorized).toBe(true);
    });
  });
});
