import * as apg from "./activityContentGenerators";
import {
  ActivityContentNote,
  ActivityContentPerson,
  ActivityContentImage,
  ActivityContentVideo,
} from "../core/activityContent";

describe("activityContentGenerators", () => {
  const opText = "Check out this amazing duck!";

  it("generateNote does", () => {
    let res: ActivityContentNote = apg.generateNote(opText);
    expect(res.attachment).toEqual(undefined);
    expect(res.type).toEqual("Note");
    expect(res.published).toMatch(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);

    res = apg.generateNote(opText, true);
    expect(res.attachment).not.toEqual("");
  });

  it("generatePerson does", () => {
    const res: ActivityContentPerson = apg.generatePerson("Ted");
    expect(res.name).not.toEqual("");
    expect(res.type).toEqual("Person");
    expect(res.published).toMatch(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  });

  it("generateImageAttachment works", () => {
    const res: ActivityContentImage = apg.generateImageAttachment();
    expect(res.url).not.toEqual("");
    expect(res.type).toEqual("Image");
  });

  it("generateVideoAttachment works", () => {
    const res: ActivityContentVideo = apg.generateVideoAttachment();
    expect(res.url).not.toEqual("");
    expect(res.type).toEqual("Video");
  });
});
