import { Signer } from "ethers";
import { setConfig } from "./config";
import { isAvailable, availabilityFilter, resolveHandle, resolveId, createRegistration } from "./handles";
import * as registry from "./core/contracts/registry";
import { createCloneProxy } from "./core/contracts/identity";
import { setupConfig } from "./test/sdkTestConfig";
import { revertHardhat, snapshotHardhat, setupSnapshot } from "./test/hardhatRPC";
import { ethers } from "ethers";
import { EthAddressRegex } from "./test/matchers";
import { convertDSNPUserIdToBigNumber } from "./core/identifiers";

const createIdentityContract = async () => {
  const receipt = await (await createCloneProxy()).wait();
  const proxyContractEvent = receipt.events?.find((event) => event.event === "ProxyCreated");
  return proxyContractEvent?.args?.[0];
};

describe("handles", () => {
  setupSnapshot();

  const notTakens = ["not-taken", "not-taken1", "not-taken2"];
  const takens = ["taken", "taken1", "taken2"];

  let provider: ethers.providers.JsonRpcProvider;
  let signer: Signer;

  beforeAll(async () => {
    ({ provider, signer } = setupConfig());
    await snapshotHardhat(provider);
    setConfig({ provider, signer });
    const logicAddress = await createIdentityContract();
    for (const handle of takens) {
      await (await registry.register(logicAddress, handle)).wait();
    }
  });

  afterAll(async () => {
    await revertHardhat(provider);
  });

  describe("#isAvailable", () => {
    it("returns true if it is available", async () => {
      expect(await isAvailable("not-taken")).toBe(true);
    });

    it("returns false if it is not available", async () => {
      expect(await isAvailable("taken")).toBe(false);
    });
  });

  describe("#availabilityFilter", () => {
    it("returns all if all are available", async () => {
      expect(await availabilityFilter(notTakens)).toEqual(notTakens);
    });

    it("returns [] if none are available", async () => {
      expect(await availabilityFilter(takens)).toEqual([]);
    });

    it("returns just the not taken ones if mixed", async () => {
      const all = ["not-taken", "taken", "not-taken1", "taken1", "taken2", "not-taken2"];
      expect(await availabilityFilter(all)).toEqual(notTakens);
    });
  });

  describe("#resolveHandle", () => {
    it("is a success pass through", async () => {
      const result = await resolveHandle("taken");
      expect(result).not.toBeNull();
      if (result === null) throw new Error();
      expect(result.contractAddr).toMatch(EthAddressRegex);
      expect(result.dsnpUserId).toEqual("0x03e8");
      expect(result.handle).toEqual("taken");
    });

    it("is a failure pass through", async () => {
      const result = await resolveHandle("not-taken");
      expect(result).toBeNull();
    });
  });

  describe("#resolveId", () => {
    it("returns null for unfound", async () => {
      const result = await resolveId("0x1388");
      expect(result).toBeNull();
    });

    it("Handles the case of a single event with number", async () => {
      const result = await resolveId("0x03e8");
      expect(result?.handle).toEqual("taken");
    });

    it("Handles the case of a single event with hex", async () => {
      const result = await resolveId("0x0" + Number(1001).toString(16));
      expect(result?.handle).toEqual("taken1");
    });

    it("Handles the case of multiple events", async () => {
      await registry.changeHandle("taken", "new-taken");
      const result = await resolveId("0x03e8");

      expect(result?.handle).toEqual("new-taken");
    });
  });

  describe("#createRegistration", () => {
    const handle = "flarp";
    const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";

    it("returns a DSNP User Id", async () => {
      const dsnpUserId = await createRegistration(fakeAddress, handle);
      const id = convertDSNPUserIdToBigNumber(dsnpUserId);

      expect(id.toNumber()).toBeGreaterThan(999);
    });
  });
});
