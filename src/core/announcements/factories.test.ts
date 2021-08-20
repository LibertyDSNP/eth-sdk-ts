import { createFollowGraphChange, createUnfollowGraphChange } from "./factories";

describe("GraphChangeAnnouncement", () => {
  it("createFollowGraphChange", () => {
    const announcement = createFollowGraphChange("dsnp://0x123", "dsnp://0xabc");

    expect(announcement).toMatchObject({
      announcementType: 1,
      changeType: 1,
      createdAt: expect.any(BigInt),
      fromId: "0x123",
      objectId: "0xabc",
    });
  });

  it("createUnfollowGraphChange", () => {
    const announcement = createUnfollowGraphChange("dsnp://0x123", "dsnp://0xabc");

    expect(announcement).toMatchObject({
      announcementType: 1,
      changeType: 0,
      createdAt: expect.any(BigInt),
      fromId: "0x123",
      objectId: "0xabc",
    });
  });
});
