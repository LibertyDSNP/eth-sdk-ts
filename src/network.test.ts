import { setConfig } from "./config";
import * as network from "./network";
import { MissingSignerConfigError, MissingFromIdConfigError } from "./core/config";
import { findEvent } from "./core/contracts/contract";
import { register } from "./core/contracts/registry";
import { DSNPGraphChangeType, AnnouncementType } from "./core/announcements";
import { Identity__factory } from "./types/typechain";
import { setupConfig } from "./test/sdkTestConfig";
import { revertHardhat, snapshotHardhat, setupSnapshot } from "./test/hardhatRPC";
import { convertToDSNPUserId, convertToDSNPUserURI, DSNPUserId, DSNPUserURI } from "./core/identifiers";

describe("network", () => {
  let registerId: DSNPUserId;
  let registerURI: DSNPUserURI;

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
    registerURI = convertToDSNPUserURI(registerEvent.args[0]);
    registerId = convertToDSNPUserId(registerEvent.args[0]);
  });

  afterAll(async () => {
    await revertHardhat(provider);
  });

  describe("follow", () => {
    describe("with a valid signer and user URI", () => {
      beforeEach(() => {
        setConfig({
          currentFromURI: "dsnp://1",
          signer,
          provider,
        });
      });

      it("returns a follow graph change announcement", async () => {
        const announcement = await network.follow(registerURI);

        expect(announcement).toMatchObject({
          fromId: BigInt(1),
          announcementType: AnnouncementType.GraphChange,
          changeType: DSNPGraphChangeType.Follow,
          objectId: registerId,
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingSignerConfigError", async () => {
        setConfig({
          currentFromURI: "dsnp://1",
          signer: undefined,
          provider,
        });

        await expect(network.follow(registerURI)).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a user URI", () => {
      it("throws MissingFromIdConfigError", async () => {
        setConfig({
          currentFromURI: undefined,
          signer,
          provider,
        });

        await expect(network.follow("dril")).rejects.toThrow(MissingFromIdConfigError);
      });
    });
  });

  describe("unfollow", () => {
    describe("with a valid signer and user URI", () => {
      beforeEach(() => {
        setConfig({
          currentFromURI: "dsnp://1",
          signer,
          provider,
        });
      });

      it("returns a follow graph change announcement", async () => {
        const announcement = await network.unfollow(registerURI);

        expect(announcement).toMatchObject({
          fromId: BigInt(1),
          announcementType: AnnouncementType.GraphChange,
          changeType: DSNPGraphChangeType.Unfollow,
          objectId: registerId,
        });
      });
    });

    describe("without a signer", () => {
      it("throws MissingSignerConfigError", async () => {
        setConfig({
          currentFromURI: "dsnp://1",
          signer: undefined,
          provider,
        });

        await expect(network.unfollow(registerURI)).rejects.toThrow(MissingSignerConfigError);
      });
    });

    describe("without a user URI", () => {
      it("throws MissingFromIdConfigError", async () => {
        setConfig({
          currentFromURI: undefined,
          signer,
          provider,
        });

        await expect(network.unfollow(registerURI)).rejects.toThrow(MissingFromIdConfigError);
      });
    });
  });
});
