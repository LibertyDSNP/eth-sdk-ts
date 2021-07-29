import * as apg from "./activityContentGenerators";
import {
  ActivityContentNote,
  ActivityContentProfile,
  ActivityContentImage,
  ActivityContentVideo,
} from "../core/activityContent";

describe("activityContentGenerators", () => {
  const opText = "Check out this amazing duck!";

  it("generateNote does", () => {
    let res: ActivityContentNote = apg.generateNote(opText);
    expect(res.attachment).toEqual(undefined);
    expect(res.type).toEqual("Note");

    res = apg.generateNote(opText, true);
    expect(res.attachment).not.toEqual(undefined);
  });

  it("generateProfile does", () => {
    const res: ActivityContentProfile = apg.generateProfile("Ted");
    expect(res.name).not.toEqual("");
    expect(res.type).toEqual("Profile");
  });

  it("generateImageAttachment works", () => {
    const res: ActivityContentImage = apg.generateImageAttachment();
    expect(res.url[0].href).not.toEqual("");
    expect(res.type).toEqual("Image");
  });

  it("generateVideoAttachment works", () => {
    const res: ActivityContentVideo = apg.generateVideoAttachment();
    expect(res.url[0].href).not.toEqual("");
    expect(res.type).toEqual("Video");
  });
});
