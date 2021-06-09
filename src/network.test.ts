import * as config from "./config";
import * as network from "./network";
import { register } from "./core/contracts/registry";
import { DSNPGraphChangeType, DSNPType } from "./core/messages/messages";
import { MissingProvider, MissingSigner, MissingUser } from "./core/utilities";
import { Identity__factory } from "./types/typechain";
import { setupConfig } from "./test/sdkTestConfig";
import { revertHardhat, snapshotHardhat, snapshotSetup } from "./test/hardhatRPC";

describe("network", () => {
  snapshotSetup();
  const { signer, provider } = setupConfig();

  beforeAll(async () => {
    await snapshotHardhat(provider);

    const fakeAddress = "0x1Ea32de10D5a18e55DEBAf379B26Cc0c6952B168";
    const identityContract = await new Identity__factory(signer).deploy(fakeAddress);
    await identityContract.deployed();

    await register(identityContract.address, "dril");
  });

  afterAll(async () => {
    await revertHardhat(provider);
  });

  describe("follow", () => {
    describe("with a valid provider, signer and user id", () => {
      beforeEach(() => {
        config.setConfig({
          currentFromId: "dsnp://0000000000000000",
          signer,
          provider,
        });
      });

      it("returns a follow graph change DSNP message", async () => {
        const message = await network.follow("dril");

        expect(message).toMatchObject({
          fromId: "dsnp://0000000000000000",
          dsnpType: DSNPType.GraphChange,
          changeType: DSNPGraphChangeType.Follow,
          objectId: "0x03e8",
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingUser", async () => {
        config.setConfig({
          currentFromId: "dsnp://0000000000000000",
          provider,
        });

        await expect(network.follow("dril")).rejects.toThrow(MissingSigner);
      });
    });

    describe("without a user id", () => {
      it("throws MissingUser", async () => {
        config.setConfig({
          signer,
          provider,
        });

        await expect(network.follow("dril")).rejects.toThrow(MissingUser);
      });
    });

    describe("without a provider", () => {
      it("throws MissingUser", async () => {
        config.setConfig({
          currentFromId: "dsnp://0000000000000000",
          signer,
        });

        await expect(network.follow("dril")).rejects.toThrow(MissingProvider);
      });
    });
  });

  describe("unfollow", () => {
    describe("with a valid provider, signer and user id", () => {
      beforeEach(() => {
        config.setConfig({
          currentFromId: "dsnp://0000000000000000",
          signer,
          provider,
        });
      });

      it("returns a follow graph change DSNP message", async () => {
        const message = await network.unfollow("dril");

        expect(message).toMatchObject({
          fromId: "dsnp://0000000000000000",
          dsnpType: DSNPType.GraphChange,
          changeType: DSNPGraphChangeType.Follow,
          objectId: "0x03e8",
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingUser", async () => {
        config.setConfig({
          currentFromId: "dsnp://0000000000000000",
          provider,
        });

        await expect(network.unfollow("dril")).rejects.toThrow(MissingSigner);
      });
    });

    describe("without a user id", () => {
      it("throws MissingUser", async () => {
        config.setConfig({
          signer,
          provider,
        });

        await expect(network.unfollow("dril")).rejects.toThrow(MissingUser);
      });
    });

    describe("without a provider", () => {
      it("throws MissingUser", async () => {
        config.setConfig({
          currentFromId: "dsnp://0000000000000000",
          signer,
        });

        await expect(network.unfollow("dril")).rejects.toThrow(MissingProvider);
      });
    });
  });
});
