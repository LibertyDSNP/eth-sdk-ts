import * as config from "./config";
import * as network from "./network";
import { MissingSignerConfigError, MissingFromIdConfigError } from "./core/config/configErrors";
import { findEvent } from "./core/contracts/contract";
import { register } from "./core/contracts/registry";
import { DSNPGraphChangeType, DSNPType } from "./core/messages/messages";
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

      it("returns a follow graph change DSNP message", async () => {
        const message = await network.follow(registerId);

        expect(message).toMatchObject({
          fromId: "dsnp://0000000000000000",
          dsnpType: DSNPType.GraphChange,
          changeType: DSNPGraphChangeType.Follow,
          objectId: registerId,
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingUser", async () => {
        config.setConfig({
          currentFromId: "dsnp://0000000000000000",
          signer: undefined,
          provider,
        });

        await expect(network.follow(registerId)).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a user id", () => {
      it("throws MissingUser", async () => {
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

      it("returns a follow graph change DSNP message", async () => {
        const message = await network.unfollow(registerId);

        expect(message).toMatchObject({
          fromId: "dsnp://0000000000000000",
          dsnpType: DSNPType.GraphChange,
          changeType: DSNPGraphChangeType.Follow,
          objectId: registerId,
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingUser", async () => {
        config.setConfig({
          currentFromId: "dsnp://0000000000000000",
          signer: undefined,
          provider,
        });

        await expect(network.unfollow(registerId)).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a user id", () => {
      it("throws MissingUser", async () => {
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
