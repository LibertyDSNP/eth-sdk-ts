import { generateBroadcast, generateReply, generateReaction, generateDSNPStream } from "./generators/dsnpGenerators";
import { countBy } from "lodash";
import { DSNPType } from "../messages/messages";

describe("dsnp functions", () => {
  it("generateDSNPStream works", () => {
    const numMsgs = 500;
    const data = generateDSNPStream(numMsgs);
    const counts = countBy(data, "actionType");

    expect(data.length).toEqual(numMsgs);

    const bcasts = counts[DSNPType.Broadcast.toString()];
    const replies = counts[DSNPType.Reply.toString()];
    const reactions = counts[DSNPType.Reaction.toString()];
    expect(replies).toBeGreaterThan(bcasts);
    expect(reactions).toBeGreaterThan(bcasts);
  });

  it("generateBroadcast works", () => {
    const dsnpMsg = generateBroadcast();
    expect(dsnpMsg).not.toBeUndefined();
    expect(dsnpMsg.type).toEqual(DSNPType.Broadcast);
    expect(dsnpMsg.fromId.length).toBeGreaterThan(0);

    // validates that it gets a parseable URL and not garbage.
    const url = new URL(dsnpMsg.uri);
    expect(url.protocol).toMatch(/^http/);
  });

  it("generateReply works", () => {
    const dsnpMsg = generateReply();
    expect(dsnpMsg).not.toBeUndefined();
    expect(dsnpMsg.type).toEqual(DSNPType.Reply);
  });
  it("generateReaction works", () => {
    const dsnpMsg = generateReaction();
    expect(dsnpMsg).not.toBeUndefined();
    expect(dsnpMsg.type).toEqual(DSNPType.Reaction);
  });
});
