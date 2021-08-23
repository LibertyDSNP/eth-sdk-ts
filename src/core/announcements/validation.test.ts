import { setConfig } from "../../config";
import { register } from "../contracts/registry";
import { sign } from "./crypto";
import { AnnouncementError, InvalidTombstoneAnnouncementTypeError } from "./errors";
import {
  createBroadcast,
  createReply,
  createReaction,
  createFollowGraphChange,
  createProfile,
  createTombstone,
  Announcement,
  AnnouncementType,
} from "./factories";
import { DSNPUserId } from "../identifiers";
import { serializeToHex } from "./serialization";
import { revertHardhat, snapshotHardhat, setupSnapshot } from "../../test/hardhatRPC";
import { setupConfig } from "../../test/sdkTestConfig";
import { getURIFromRegisterTransaction } from "../../test/testAccounts";
import TestStore from "../../test/testStore";
import { Identity__factory } from "../../types/typechain";
import { isValidAnnouncement } from "./validation";

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
        const announcement = createFollowGraphChange(userId, followeeId);
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(true);
      });

      it("returns false for graph change announcements with invalid fromIds", async () => {
        const announcement = createFollowGraphChange(userId, followeeId);
        announcement["fromId"] = "badbadbad";
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(false);
      });

      it("returns false for graph change announcements with invalid objectIds", async () => {
        const announcement = createFollowGraphChange(userId, followeeId);
        announcement["objectId"] = "badbadbad";
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(false);
      });

      it("returns false for graph change announcements without createdAt", async () => {
        const announcement = createFollowGraphChange(userId, followeeId);
        announcement["createdAt"] = undefined as unknown as bigint;
        const signedAnnouncement = await sign(announcement as unknown as Announcement);

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

      it("throws for tombstone announcements without createdAt", async () => {
        const announcement = createTombstone(
          userId,
          AnnouncementType.Broadcast,
          "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01"
        );
        announcement["createdAt"] = undefined as unknown as bigint;
        const signedAnnouncement = await sign(announcement);

        await expect(isValidAnnouncement(signedAnnouncement)).rejects.toThrow(AnnouncementError);
      });
    });

    describe("for BroadcastAnnouncement", () => {
      it("returns true for valid broadcast announcements", async () => {
        const announcement = await createBroadcast(
          userId,
          "https://fakeurl.org",
          "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(true);
      });

      it("returns false for broadcast announcements without createdAt", async () => {
        const announcement = await createBroadcast(
          userId,
          "https://fakeurl.org",
          "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );
        announcement["createdAt"] = undefined as unknown as bigint;
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(false);
      });
    });

    describe("for ReplyAnnouncement", () => {
      it("returns true for valid reply announcements", async () => {
        const announcement = await createReply(
          userId,
          "https://fakeurl.org",
          "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
          "dsnp://0x1234567/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(true);
      });

      it("returns false for reply announcements without createdAt", async () => {
        const announcement = await createReply(
          userId,
          "https://fakeurl.org",
          "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
          "dsnp://0x1234567/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );
        announcement["createdAt"] = undefined as unknown as bigint;
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(false);
      });
    });

    describe("for ReactionAnnouncement", () => {
      it("returns true for valid reaction announcements", async () => {
        const announcement = await createReaction(
          userId,
          "🎉",
          "dsnp://0x1234567/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(true);
      });

      it("returns false for reaction announcements without createdAt", async () => {
        const announcement = await createReaction(
          userId,
          "🎉",
          "dsnp://0x1234567/0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );
        announcement["createdAt"] = undefined as unknown as bigint;
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(false);
      });
    });

    describe("for ProfileAnnouncement", () => {
      it("returns true for valid profile announcements", async () => {
        const announcement = await createProfile(
          userId,
          "https://fakeurl.org",
          "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(true);
      });

      it("returns false for profile announcements without createdAt", async () => {
        const announcement = await createProfile(
          userId,
          "https://fakeurl.org",
          "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );
        announcement["createdAt"] = undefined as unknown as bigint;
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(false);
      });
    });
  });
});
