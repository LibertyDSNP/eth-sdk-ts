import { createNote, createProfile } from "../activityContent";
import { setConfig } from "../../config";
import { broadcast, reply, react, profile } from "../../content";
import { register } from "../contracts/registry";
import { sign } from "./crypto";
import { AnnouncementError, InvalidTombstoneAnnouncementTypeError } from "./errors";
import { createTombstone, AnnouncementType, DSNPGraphChangeType } from "./factories";
import { buildDSNPAnnouncementURI, DSNPUserId } from "../identifiers";
import { revertHardhat, snapshotHardhat, setupSnapshot } from "../../test/hardhatRPC";
import { setupConfig } from "../../test/sdkTestConfig";
import TestStore from "../../test/testStore";
import { getURIFromRegisterTransaction } from "../../test/testAccounts";
import { Identity__factory } from "../../types/typechain";
import { isValidAnnouncement } from "./validation";
import { serializeToHex } from "./serialization";

describe("validation", () => {
  const { signer, provider } = setupConfig();
  let userId: DSNPUserId;

  setConfig({
    store: new TestStore(),
  });
  setupSnapshot();

  beforeAll(async () => {
    await snapshotHardhat(provider);
    const userAddress = await signer.getAddress();
    const userIdentityContract = await new Identity__factory(signer).deploy(userAddress);
    await userIdentityContract.deployed();
    const userTransaction = await register(userIdentityContract.address, "Bob Loblaw");
    userId = serializeToHex(await getURIFromRegisterTransaction(userTransaction));

    setConfig({
      currentFromURI: userId,
    });
  });

  afterAll(async () => {
    await revertHardhat(provider);
  });

  describe("isValidAnnouncement", () => {
    describe("for GraphChangeAnnouncements", () => {
      let followeeId: DSNPUserId;

      setupSnapshot();

      beforeAll(async () => {
        await snapshotHardhat(provider);
        const followeeAddress = await signer.getAddress();
        const followeeIdentityContract = await new Identity__factory(signer).deploy(followeeAddress);
        await followeeIdentityContract.deployed();
        const followeeTransaction = await register(followeeIdentityContract.address, "George Bluth");
        followeeId = serializeToHex(await getURIFromRegisterTransaction(followeeTransaction));
      });

      afterAll(async () => {
        await revertHardhat(provider);
      });

      it("returns true for valid graph change announcements", async () => {
        const announcement = {
          fromId: userId,
          announcementType: AnnouncementType.GraphChange,
          changeType: DSNPGraphChangeType.Follow,
          createdAt: BigInt(+Date.now()),
          objectId: followeeId,
        };
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(true);
      });

      it("returns false for graph change announcements with invalid fromIds", async () => {
        const announcement = {
          fromId: "not a valid id",
          announcementType: AnnouncementType.GraphChange,
          changeType: DSNPGraphChangeType.Follow,
          createdAt: BigInt(+Date.now()),
          objectId: followeeId,
        };
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(false);
      });

      it("returns false for graph change announcements with invalid objectIds", async () => {
        const announcement = {
          fromId: userId,
          announcementType: AnnouncementType.GraphChange,
          changeType: DSNPGraphChangeType.Follow,
          createdAt: BigInt(+Date.now()),
          objectId: "not a valid id",
        };
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(false);
      });
    });

    describe("for TombstoneAnnouncement", () => {
      it("returns true for valid tombstone announcements", async () => {
        const announcement = createTombstone(
          userId,
          AnnouncementType.Broadcast,
          "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01"
        );
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(true);
      });

      it("throws for a tombstone announcements with an invalid target signature", async () => {
        const announcement = createTombstone(userId, AnnouncementType.Broadcast, "0x0");
        const signedAnnouncement = await sign(announcement);

        await expect(isValidAnnouncement(signedAnnouncement)).rejects.toThrow(AnnouncementError);
      });

      it("throws for a tombstone announcements with an invalid target type", async () => {
        const announcement = createTombstone(
          userId,
          AnnouncementType.GraphChange,
          "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01"
        );
        const signedAnnouncement = await sign(announcement);

        await expect(isValidAnnouncement(signedAnnouncement)).rejects.toThrow(InvalidTombstoneAnnouncementTypeError);
      });
    });

    describe("for BroadcastAnnouncement", () => {
      const activityContent = createNote("words words words");

      it("returns true for valid broadcast announcements", async () => {
        const announcement = await broadcast(activityContent);

        expect(await isValidAnnouncement(announcement)).toEqual(true);
      });
    });

    describe("for ReplyAnnouncement", () => {
      const linkContent = createNote("hey");
      const noteContent = createNote("hi");

      it("returns true for valid reply announcements", async () => {
        const broadcastAnnouncement = await broadcast(linkContent);
        const replyAnnouncement = await reply(
          noteContent,
          buildDSNPAnnouncementURI(broadcastAnnouncement.fromId, broadcastAnnouncement.contentHash)
        );

        expect(await isValidAnnouncement(replyAnnouncement)).toEqual(true);
      });
    });

    describe("for ReactionAnnouncement", () => {
      const linkContent = createNote("blahblehblah");

      it("returns true for valid reaction announcements", async () => {
        const broadcastAnnouncement = await broadcast(linkContent);
        const reactionAnnouncement = await react(
          "🎉",
          buildDSNPAnnouncementURI(broadcastAnnouncement.fromId, broadcastAnnouncement.contentHash)
        );

        expect(await isValidAnnouncement(reactionAnnouncement)).toEqual(true);
      });
    });

    describe("for ProfileAnnouncement", () => {
      const activityContent = createProfile({ name: "🌹🚗" });

      it("returns true for valid broadcast announcements", async () => {
        const announcement = await profile(activityContent);

        expect(await isValidAnnouncement(announcement)).toEqual(true);
      });
    });
  });
});
