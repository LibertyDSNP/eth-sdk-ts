import { ContractReceipt, ethers, BigNumber } from "ethers";
import { EthereumAddress } from "../../types/Strings";
import { getContractAddress, findEvent } from "./contract";
import {
  createCloneProxy,
  createCloneProxyWithOwner,
  createBeaconProxy,
  createBeaconProxyWithOwner,
  createAndRegisterBeaconProxy,
  isAuthorizedTo,
  Permission,
} from "./identity";
import { EthAddressRegex } from "../../test/matchers";
import { setupConfig } from "../../test/sdkTestConfig";
import { setupSnapshot } from "../../test/hardhatRPC";
import { MissingContract } from "../../config";

const owner = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
const nonOwner = "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc";

describe("identity", () => {
  let provider: ethers.providers.JsonRpcProvider;
  setupSnapshot();
  beforeAll(() => {
    ({ provider } = setupConfig());
  });

  const getBeacon = async (): Promise<string> => {
    const addr = await getContractAddress(provider, "Beacon");
    if (!addr) throw MissingContract;
    return addr;
  };

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
    it("expect isAuthorizedTo to return false for non owner", async () => {
      const authorized = await isAuthorizedTo(nonOwner, contractAddress, Permission.ANNOUNCE, 0);
      expect(authorized).toBe(false);
    });
  });

  describe("createBeaconProxy", () => {
    it("creates a beacon proxy contract with specified beacon", async () => {
      const beacon = await getBeacon();
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
      const beacon = await getBeacon();
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

  describe("#createAndRegisterBeaconProxy", () => {
    const handle = "flarp";
    const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";

    it("returns a Contract Transaction that can be resolved into a DSNP Id", async () => {
      const transaction = await createAndRegisterBeaconProxy(fakeAddress, handle);

      const receipt = await transaction.wait(1);

      // registration ids start at 1000
      expect(getIdFromReceipt(receipt).toNumber()).toBeGreaterThan(999);

      const address = getAddressFromReceipt(receipt);
      expect(ethers.utils.isAddress(address)).toBeTruthy();
    });
  });
});

const getIdFromReceipt = (receipt: ContractReceipt): BigNumber => {
  const registerEvent = findEvent("DSNPRegistryUpdate", receipt.logs);
  return registerEvent.args[0];
};

const getAddressFromReceipt = (receipt: ContractReceipt): string => {
  const proxyEvent = findEvent("ProxyCreated", receipt.logs);
  return proxyEvent.args[0];
};
