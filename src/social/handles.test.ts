import { isAvailable, availabilityFilter } from "./handles";
import * as registry from "../contracts/registry";
import { createCloneProxy } from "../contracts/identity";
import { setupConfig } from "../test/sdkTestConfig";
import { revertHardhat, snapshotHardhat } from "../test/hardhatRPC";
import { ethers } from "ethers";

const createIdentityContract = async () => {
  const receipt = await (await createCloneProxy()).wait();
  const proxyContractEvent = receipt.events?.find((event) => event.event === "ProxyCreated");
  return proxyContractEvent?.args?.[0];
};

describe("handles", () => {
  const notTakens = ["not-taken", "not-taken1", "not-taken2"];
  const takens = ["taken", "taken1", "taken2"];

  let provider: ethers.providers.JsonRpcProvider;

  beforeAll(async () => {
    ({ provider } = setupConfig());
    await snapshotHardhat(provider);
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
});
