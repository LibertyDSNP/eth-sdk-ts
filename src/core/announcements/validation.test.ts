import { createLink, createNote, createProfile } from "../activityContent";
import { setConfig } from "../../config";
import { broadcast, reply, react, profile } from "../../content";
import { register } from "../contracts/registry";
import { sign } from "./crypto";
import { createFollowGraphChange } from "./factories";
import { buildDSNPAnnouncementUri, DSNPUserId } from "../identifiers";
import { revertHardhat, snapshotHardhat, setupSnapshot } from "../../test/hardhatRPC";
import { setupConfig } from "../../test/sdkTestConfig";
import TestStore from "../../test/testStore";
import { getIdFromRegisterTransaction } from "../../test/testAccounts";
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
    userId = await getIdFromRegisterTransaction(userTransaction);

    setConfig({
      currentFromId: userId,
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
        followeeId = await getIdFromRegisterTransaction(followeeTransaction);
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
        const announcement = createFollowGraphChange("not a valid id", followeeId);
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(false);
      });

      it("returns false for graph change announcements with invalid objectIds", async () => {
        const announcement = createFollowGraphChange(userId, "not a valid id");
        const signedAnnouncement = await sign(announcement);

        expect(await isValidAnnouncement(signedAnnouncement)).toEqual(false);
      });
    });

    describe("for BroadcastAnnouncement", () => {
      const activityContent = createLink("https://forum.dsnp.org");

      it("returns true for valid broadcast announcements", async () => {
        const announcement = await broadcast(activityContent);

        expect(await isValidAnnouncement(announcement)).toEqual(true);
      });
    });

    describe("for ReplyAnnouncement", () => {
      const linkContent = createLink("https://spec.dsnp.org");
      const noteContent = createNote("Cool website!");

      it("returns true for valid reply announcements", async () => {
        const broadcastAnnouncement = await broadcast(linkContent);
        const replyAnnouncement = await reply(
          noteContent,
          buildDSNPAnnouncementUri(broadcastAnnouncement.fromId, broadcastAnnouncement.contentHash)
        );

        expect(await isValidAnnouncement(replyAnnouncement)).toEqual(true);
      });
    });

    describe("for ReactionAnnouncement", () => {
      const linkContent = createLink("https://dsnp.org");

      it("returns true for valid reaction announcements", async () => {
        const broadcastAnnouncement = await broadcast(linkContent);
        const reactionAnnouncement = await react(
          "🎉",
          buildDSNPAnnouncementUri(broadcastAnnouncement.fromId, broadcastAnnouncement.contentHash)
        );

        expect(await isValidAnnouncement(reactionAnnouncement)).toEqual(true);
      });
    });

    describe("for ProfileAnnouncement", () => {
      const activityContent = createProfile("🌹🚗");

      it("returns true for valid broadcast announcements", async () => {
        const announcement = await profile(activityContent);

        expect(await isValidAnnouncement(announcement)).toEqual(true);
      });
    });
  });
});
