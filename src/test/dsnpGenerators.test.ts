import {
  generateBroadcast,
  generateGraphChange,
  generateReply,
  generateKeyList,
  generateReaction,
  generateDSNPStream,
} from "./generators/dsnpGenerators";
import { ActionType } from "../batch/actionType";
import { countBy } from "lodash";

describe("dsnp functions", () => {
  it("generateDSNPStream works", () => {
    const numMsgs = 500;
    const data = generateDSNPStream(numMsgs);
    const counts = countBy(data, "actionType");

    expect(data.length).toEqual(numMsgs);

    const bcasts = counts[ActionType.Broadcast.toString()];
    const replies = counts[ActionType.Reply.toString()];
    const graphChanges = counts[ActionType.GraphChange.toString()];
    const reactions = counts[ActionType.Reaction.toString()];
    const keylists = counts[ActionType.KeyList.toString()] || 0;
    expect(replies).toBeGreaterThan(bcasts);
    expect(reactions).toBeGreaterThan(bcasts);
    expect(replies).toBeGreaterThan(graphChanges);
    expect(bcasts).toBeGreaterThan(keylists);
  });

  it("generateBroadcast works", () => {
    const dsnpMsg = generateBroadcast();
    expect(dsnpMsg).not.toBeUndefined();
    expect(dsnpMsg.actionType).toEqual(ActionType.Broadcast);
    expect(dsnpMsg.fromAddress.length).toBeGreaterThan(0);

    // validates that it gets a parseable URL and not garbage.
    const url = new URL(dsnpMsg.uri);
    expect(url.protocol).toMatch(/^http/);
  });
  it("generateGraphChange works", () => {
    const dsnpMsg = generateGraphChange();
    expect(dsnpMsg).not.toBeUndefined();
    expect(dsnpMsg.actionType).toEqual(ActionType.GraphChange);
  });
  it("generateReply works", () => {
    const dsnpMsg = generateReply();
    expect(dsnpMsg).not.toBeUndefined();
    expect(dsnpMsg.actionType).toEqual(ActionType.Reply);
  });
  it("generateReaction works", () => {
    const dsnpMsg = generateReaction();
    expect(dsnpMsg).not.toBeUndefined();
    expect(dsnpMsg.actionType).toEqual(ActionType.Reaction);
  });
  it("generateKeyList works", () => {
    const dsnpMsg = generateKeyList();
    expect(dsnpMsg).not.toBeUndefined();
    expect(dsnpMsg.actionType).toEqual(ActionType.KeyList);
  });
});
