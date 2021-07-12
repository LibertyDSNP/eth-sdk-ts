import * as config from "./config";
import * as network from "./network";
import { MissingSignerConfigError, MissingFromIdConfigError } from "./core/config";
import { findEvent } from "./core/contracts/contract";
import { register } from "./core/contracts/registry";
import { DSNPGraphChangeType, DSNPType } from "./core/announcements";
import { Identity__factory } from "./types/typechain";
import { setupConfig } from "./test/sdkTestConfig";
import { revertHardhat, snapshotHardhat, setupSnapshot } from "./test/hardhatRPC";
import { convertBigNumberToDSNPUserId, DSNPUserId } from "./core/identifiers";

describe("network", () => {
  let registerId: DSNPUserId;

  setupSnapshot();
  const { signer, provider } = setupConfig();

  beforeAll(async () => {
    await snapshotHardhat(provider);

    const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
    const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
    await identityContract.deployed();

    const txn = await register(identityContract.address, "dril");
    const receipt = await txn.wait(1);

    const registerEvent = findEvent("DSNPRegistryUpdate", receipt.logs);
    registerId = convertBigNumberToDSNPUserId(registerEvent.args[0]);
  });

  afterAll(async () => {
    await revertHardhat(provider);
  });

  describe("follow", () => {
    describe("with a valid signer and user id", () => {
      beforeEach(() => {
        config.setConfig({
          currentFromId: "dsnp://0000000000000000",
          signer,
          provider,
        });
      });

      it("returns a follow graph change announcement", async () => {
        const announcement = await network.follow(registerId);

        expect(announcement).toMatchObject({
          fromId: "dsnp://0000000000000000",
          dsnpType: DSNPType.GraphChange,
          changeType: DSNPGraphChangeType.Follow,
          objectId: registerId,
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingSignerConfigError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0000000000000000",
          signer: undefined,
          provider,
        });

        await expect(network.follow(registerId)).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a user id", () => {
      it("throws MissingFromIdConfigError", async () => {
        config.setConfig({
          currentFromId: undefined,
          signer,
          provider,
        });

        await expect(network.follow("dril")).rejects.toThrow(MissingFromIdConfigError);
      });
    });
  });

  describe("unfollow", () => {
    describe("with a valid signer and user id", () => {
      beforeEach(() => {
        config.setConfig({
          currentFromId: "dsnp://0000000000000000",
          signer,
          provider,
        });
      });

      it("returns a follow graph change announcement", async () => {
        const announcement = await network.unfollow(registerId);

        expect(announcement).toMatchObject({
          fromId: "dsnp://0000000000000000",
          dsnpType: DSNPType.GraphChange,
          changeType: DSNPGraphChangeType.Unfollow,
          objectId: registerId,
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingSignerConfigError", async () => {
        config.setConfig({
          currentFromId: "dsnp://0000000000000000",
          signer: undefined,
          provider,
        });

        await expect(network.unfollow(registerId)).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a user id", () => {
      it("throws MissingFromIdConfigError", async () => {
        config.setConfig({
          currentFromId: undefined,
          signer,
          provider,
        });

        await expect(network.unfollow(registerId)).rejects.toThrow(MissingFromIdConfigError);
      });
    });
  });
});
