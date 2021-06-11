import { addresses } from "@dsnp/test-generators";
const getNPrefabAddresses = addresses.getNPrefabAddresses;

import * as apg from "./activityPubGenerators";
import { HexString } from "../types/Strings";
import { ActivityPub, ActivityPubAttachment } from "../core/activityPub/activityPub";

describe("activityPubGenerators", () => {
  const addrs: Array<HexString> = getNPrefabAddresses(2);
  const from = addrs[0];
  const to = addrs[1];
  const opText = "Check out this amazing duck!";
  const replyText = "fascinating!";

  it("generateReply does", () => {
    const res: ActivityPub = apg.generateReply(from, replyText, to);
    expect(res.attributedTo).toEqual(from);
    expect(res.inReplyTo).toEqual(to);
    expect(res.type).toEqual("Note");
  });

  it("activityPubGenerators does", () => {
    let res: ActivityPub = apg.generateNote(from, opText);
    expect(res.attachments).toEqual([]);
    expect(res.type).toEqual("Note");
    expect(res.inReplyTo).toBeUndefined();

    res = apg.generateNote(from, opText, true);
    expect(res.attachments).not.toEqual("");
  });

  it("generatePerson does", () => {
    const res: ActivityPub = apg.generatePerson(from);
    expect(res.name).not.toEqual("");
    expect(res.type).toEqual("Person");
  });

  it("generateImageAttachment works", () => {
    const res: ActivityPubAttachment = apg.generateImageAttachment();
    expect(res.url).not.toEqual("");
    expect(res.type).toEqual("Image");
  });

  it("generateVideoAttachment works", () => {
    const res: ActivityPubAttachment = apg.generateVideoAttachment();
    expect(res.url).not.toEqual("");
    expect(res.type).toEqual("Video");
  });
});
