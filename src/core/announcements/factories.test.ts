import { createFollowGraphChange, createUnfollowGraphChange } from "./factories";

describe("GraphChangeAnnouncement", () => {
  it("createFollowGraphChange", () => {
    const announcement = createFollowGraphChange("dsnp://123", "dsnp://890");

    expect(announcement).toMatchObject({
      announcementType: 1,
      changeType: 1,
      createdAt: expect.any(BigInt),
      fromId: BigInt(123),
      objectId: BigInt(890),
    });
  });

  it("createUnfollowGraphChange", () => {
    const announcement = createUnfollowGraphChange("dsnp://123", "dsnp://890");

    expect(announcement).toMatchObject({
      announcementType: 1,
      changeType: 0,
      createdAt: expect.any(BigInt),
      fromId: BigInt(123),
      objectId: BigInt(890),
    });
  });
});
