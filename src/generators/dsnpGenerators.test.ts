import { generateBroadcast, generateReply, generateReaction, generateDSNPStream } from "./dsnpGenerators";
import { DSNPType } from "../core/messages/messages";

describe("dsnp functions", () => {
  it("generateDSNPStream works", () => {
    const numMsgs = 100;
    const data = generateDSNPStream(numMsgs);
    const counts = data.reduce(
      (acc: { [key in number]: number }, current) => {
        acc[current["dsnpType"]]++;
        return acc;
      },
      {
        [DSNPType.Broadcast]: 0,
        [DSNPType.Reply]: 0,
        [DSNPType.Reaction]: 0,
      }
    );

    expect(data.length).toEqual(numMsgs);

    const bcasts = counts[DSNPType.Broadcast];
    const replies = counts[DSNPType.Reply];
    const reactions = counts[DSNPType.Reaction];
    expect(replies).toBeGreaterThan(bcasts);
    expect(reactions).toBeGreaterThan(bcasts);
  });

  it("generateBroadcast works", () => {
    const dsnpMsg = generateBroadcast();
    expect(dsnpMsg).not.toBeUndefined();
    expect(dsnpMsg.dsnpType).toEqual(DSNPType.Broadcast);
    expect(dsnpMsg.fromId.length).toBeGreaterThan(0);

    // validates that it gets a parseable URL and not garbage.
    const url = new URL(dsnpMsg.url);
    expect(url.protocol).toMatch(/^http/);
  });

  it("generateReply works", () => {
    const dsnpMsg = generateReply();
    expect(dsnpMsg).not.toBeUndefined();
    expect(dsnpMsg.dsnpType).toEqual(DSNPType.Reply);
  });
  it("generateReaction works", () => {
    const dsnpMsg = generateReaction();
    expect(dsnpMsg).not.toBeUndefined();
    expect(dsnpMsg.dsnpType).toEqual(DSNPType.Reaction);
  });
});
