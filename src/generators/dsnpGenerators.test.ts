import { generateBroadcast, generateReply, generateReaction, generateDSNPStream } from "./dsnpGenerators";
import { AnnouncementType } from "../core/announcements";

describe("dsnp functions", () => {
  it("generateDSNPStream works", () => {
    const numMsgs = 100;
    const data = generateDSNPStream(numMsgs);
    const counts = data.reduce(
      (acc: { [key in number]: number }, current) => {
        acc[current["announcementType"]]++;
        return acc;
      },
      {
        [AnnouncementType.Broadcast]: 0,
        [AnnouncementType.Reply]: 0,
        [AnnouncementType.Reaction]: 0,
      }
    );

    expect(data.length).toEqual(numMsgs);

    const bcasts = counts[AnnouncementType.Broadcast];
    const replies = counts[AnnouncementType.Reply];
    const reactions = counts[AnnouncementType.Reaction];
    expect(replies).toBeGreaterThan(bcasts);
    expect(reactions).toBeGreaterThan(bcasts);
  });

  it("generateBroadcast works", () => {
    const dsnpMsg = generateBroadcast();
    expect(dsnpMsg).not.toBeUndefined();
    expect(dsnpMsg.announcementType).toEqual(AnnouncementType.Broadcast);
    expect(dsnpMsg.fromId.length).toBeGreaterThan(0);

    // validates that it gets a parseable URL and not garbage.
    const url = new URL(dsnpMsg.url);
    expect(url.protocol).toMatch(/^http/);
  });

  it("generateReply works", () => {
    const dsnpMsg = generateReply();
    expect(dsnpMsg).not.toBeUndefined();
    expect(dsnpMsg.announcementType).toEqual(AnnouncementType.Reply);
  });
  it("generateReaction works", () => {
    const dsnpMsg = generateReaction();
    expect(dsnpMsg).not.toBeUndefined();
    expect(dsnpMsg.announcementType).toEqual(AnnouncementType.Reaction);
  });
});
