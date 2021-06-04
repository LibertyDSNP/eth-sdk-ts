import { ContractReceipt, ethers } from "ethers";
import { EthereumAddress } from "../types/Strings";
import {
  createCloneProxy,
  createCloneProxyWithOwner,
  createBeaconProxy,
  createBeaconProxyWithOwner,
  isAuthorizedTo,
  Permission,
} from "./identity";
import { EthAddressRegex } from "../test/matchers";

const owner = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
const nonOwner = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc";
const beacon = "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6";

describe("identity", () => {
  describe("createCloneProxy", () => {
    it("creates a proxy contract", async () => {
      const proxyReceipt: ContractReceipt = (await (await createCloneProxy()).wait()) as ContractReceipt;
      const proxyContractEvents =
        proxyReceipt && proxyReceipt.events
          ? proxyReceipt.events.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
      expect(contractAddress).toMatch(EthAddressRegex);
    });
  });

  describe("createCloneProxy with owner", () => {
    let proxyReceipt: ContractReceipt;
    let proxyContractEvents: ethers.Event[];
    let contractAddress: EthereumAddress;

    beforeEach(async () => {
      proxyReceipt = (await (await createCloneProxyWithOwner(owner)).wait()) as ContractReceipt;
      proxyContractEvents =
        proxyReceipt && proxyReceipt.events && proxyReceipt
          ? proxyReceipt.events.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
    });

    it("creates a proxy contract", async () => {
      expect(contractAddress).toMatch(EthAddressRegex);
    });

    it("expect isAuthorizedTo to return true for owner", async () => {
      const authorized = await isAuthorizedTo(owner, contractAddress, Permission.ANNOUNCE, 0);
      expect(authorized).toBe(true);
    });
    //
    it("expect isAuthorizedTo to return false for non owner", async () => {
      const authorized = await isAuthorizedTo(nonOwner, contractAddress, Permission.ANNOUNCE, 0);
      expect(authorized).toBe(false);
    });
  });

  describe("createBeaconProxy", () => {
    it("creates a beacon proxy contract with specified beacon", async () => {
      const proxyReceipt: ContractReceipt = (await (await createBeaconProxy(beacon)).wait()) as ContractReceipt;
      const proxyContractEvents =
        proxyReceipt && proxyReceipt.events
          ? proxyReceipt.events.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      const contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
      expect(contractAddress).toMatch(EthAddressRegex);
    });
  });

  describe("createBeaconProxyWithOwner", () => {
    let proxyReceipt: ContractReceipt;
    let proxyContractEvents: ethers.Event[];
    let contractAddress: EthereumAddress;

    beforeEach(async () => {
      proxyReceipt = (await (await createBeaconProxyWithOwner(owner, beacon)).wait()) as ContractReceipt;
      proxyContractEvents =
        proxyReceipt && proxyReceipt.events
          ? proxyReceipt.events.filter((event) => {
              return event.event === "ProxyCreated";
            })
          : [];
      contractAddress = proxyContractEvents[0].args ? proxyContractEvents[0].args[0] : null;
    });
    it("creates a beacon proxy contract", async () => {
      expect(contractAddress).toMatch(EthAddressRegex);
    });

    it("expect isAuthorized  to return false or nonOwner", async () => {
      const authorized = await isAuthorizedTo(nonOwner, contractAddress, Permission.ANNOUNCE, 0);
      expect(authorized).toBe(false);
    });

    it("expect isAuthorizedTo to return true for owner", async () => {
      const authorized = await isAuthorizedTo(owner, contractAddress, Permission.ANNOUNCE, 0);
      expect(authorized).toBe(true);
    });
  });
});
