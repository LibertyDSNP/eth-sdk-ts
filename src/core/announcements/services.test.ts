import { ethers } from "ethers";

import { sign } from "./crypto";
import { createBroadcast } from "./factories";
import { convertSignedAnnouncementToAnnouncement } from "./services";

describe("convertSignedAnnouncementToAnnouncement", () => {
  const signer = ethers.Wallet.createRandom();

  it("returns the same announcement unsigned", async () => {
    const announcement = createBroadcast("1", "https://dsnp.org", "0x12345");
    const signedAnnouncement = await sign(announcement, { signer });
    const unsignedAnnouncement = await convertSignedAnnouncementToAnnouncement(signedAnnouncement);

    expect(unsignedAnnouncement).toMatchObject(announcement);
  });
});
