import * as fs from "fs";

import {
  BroadcastAnnouncement,
  Announcement,
  AnnouncementType,
  ReactionAnnouncement,
  ReplyAnnouncement,
} from "../core/announcements";
import { EthereumAddress } from "../types/Strings";
import { generateHexString, randInt, sample } from "@dsnp/test-generators";
import { addresses, sampleText } from "@dsnp/test-generators/";

const PREFAB_URLS = sampleText.prefabURLs;
const generateEthereumAddress = addresses.generateEthereumAddress;

/**
 * generateDSNPStream is meant to simulate incoming Announcements of all kinds.
 * It generates a randomized list of Announcements at an estimated frequency for each type.
 *
 * @param count - number of Announcements to stream
 * @returns an array of Announcements.
 */
export const generateDSNPStream = (count: number): Array<Announcement> => {
  // A WAG of the ratios of Announcement types
  const reactionReplyMax = 1000;
  // TODO leave these here for when other types are implemented
  // const broadcastMax = Math.ceil(reactionReplyMax / 3);
  // const graphMax = Math.ceil(broadcastMax / 10);
  // const profileMax = Math.ceil(graphMax / 50);

  // this sets the frequency of generated types to approximately the ratios above
  const maxInt = reactionReplyMax * 10;

  return Array.from({ length: count }, () => {
    const value = randInt(maxInt);
    let msg: Announcement;
    if (value > reactionReplyMax) {
      // estimate reactions and replies average about the same
      msg = value % 2 === 0 ? generateReaction() : generateReply();
    } else {
      msg = generateBroadcast();
    }
    return msg;
  });
};

/**
 * writeFixture writes Announcements as JSON to provided jsonFilePath
 *
 * @param data - the data to write out
 * @param jsonFilePath - where to write the output file
 * @returns number of bytes written
 */
export const writeFixture = (data: Array<Announcement>, jsonFilePath: string): number => {
  const ws = fs.createWriteStream(jsonFilePath).on("error", (e: Error) => {
    throw new Error("createWriteStream failed: \n" + e.toString());
  });
  const ok = true;
  let i = 0;

  const header = '{ "entries": [';
  ws.write(header);
  do {
    ws.write(data[i] + ",");
    i++;
  } while (i < data.length - 1 && ok);
  ws.write(data[data.length - 1]);
  ws.end("]}");
  return ws.bytesWritten;
};

export const generateBroadcast = (from?: EthereumAddress): BroadcastAnnouncement => {
  return {
    announcementType: AnnouncementType.Broadcast,
    fromId: from ? from : generateEthereumAddress(),
    contentHash: generateHexString(64),
    url: sample(PREFAB_URLS),
  };
};

/**
 * generateReply
 *
 * @param from - a desired fromID (optional)
 */
export const generateReply = (from?: EthereumAddress): ReplyAnnouncement => {
  return {
    announcementType: AnnouncementType.Reply,
    fromId: from ? from : generateEthereumAddress(),
    inReplyTo: generateHexString(64),
    contentHash: generateHexString(64),
    url: sample(PREFAB_URLS),
  };
};

/**
 * generateReaction
 *
 * @param from - a desired fromID (optional)
 */
export const generateReaction = (from?: EthereumAddress): ReactionAnnouncement => {
  return {
    announcementType: AnnouncementType.Reaction,
    fromId: from ? from : generateEthereumAddress(),
    emoji: generateHexString(20),
    inReplyTo: generateHexString(64),
  };
};
