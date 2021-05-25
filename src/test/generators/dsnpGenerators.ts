import * as fs from "fs";
import { times } from "lodash";

import { DSNPType } from "../../messages/messages";
import { EthereumAddress } from "../../types/Strings";
import { generateHexString, randInt, sample } from "@dsnp/test-generators";
import { addresses, sampleText } from "@dsnp/test-generators/";
import {
  DSNPBatchMessage,
  BatchBroadcastMessage,
  BatchReplyMessage,
  BatchReactionMessage,
} from "../../batch/batchMesssages";

const prefabURLs = sampleText.prefabURLs;
const generateEthereumAddress = addresses.generateEthereumAddress;

/**
 * @function generateDSNPStream is meant to simulate incoming DSNP Messages of all kinds.
 * It generates a randomized list of DSNP messages at an estimated frequency for each type.
 * @param messageCount
 * @return an array of Messages.
 */
export const generateDSNPStream = (messageCount: number): Array<DSNPBatchMessage> => {
  // A WAG of the ratios of message types
  const reactionReplyMax = 1000;
  // TODO leave these here for when other types are implemented
  // const broadcastMax = Math.ceil(reactionReplyMax / 3);
  // const graphMax = Math.ceil(broadcastMax / 10);
  // const profileMax = Math.ceil(graphMax / 50);

  // this sets the frequency of generated types to approximately the ratios above
  const maxInt = reactionReplyMax * 10;

  const data: DSNPBatchMessage[] = [];
  times(messageCount, () => {
    const value = randInt(maxInt);
    let msg: DSNPBatchMessage;
    if (value > reactionReplyMax) {
      // estimate reactions and replies average about the same
      msg = value % 2 === 0 ? generateReaction() : generateReply();
    } else {
      msg = generateBroadcast();
    }
    data.push(msg);
  });
  return data;
};

/**
 * @function writeFixture writes messages as JSON to provided jsonFilePath
 * @param data the data to write out
 * @param jsonFilePath where to write the output file
 * @return number of bytes written
 */
export const writeFixture = (data: Array<DSNPBatchMessage>, jsonFilePath: string): number => {
  const ws = fs.createWriteStream(jsonFilePath).on("error", (e: Error) => {
    throw new Error("createWriteStream failed: \n" + e.toString());
  });
  const ok = true;
  let i = 0;

  // eslint-disable-next-line
  const header = "{ \"entries\": [";
  ws.write(header);
  do {
    ws.write(data[i] + ",");
    i++;
  } while (i < data.length - 1 && ok);
  ws.write(data[data.length - 1]);
  ws.end("]}");
  return ws.bytesWritten;
};

/**
 * generateBroadcast
 * @param from - a desired fromID (optional)
 */
export const generateBroadcast = (from?: EthereumAddress): BatchBroadcastMessage => {
  return {
    type: DSNPType.Broadcast,
    fromId: from ? from : generateEthereumAddress(),
    contentHash: generateHexString(64),
    signature: generateHexString(256),
    uri: sample(prefabURLs),
  };
};

/**
 * generateReply
 * @param from - a desired fromID (optional)
 */
export const generateReply = (from?: EthereumAddress): BatchReplyMessage => {
  return {
    type: DSNPType.Reply,
    fromId: from ? from : generateEthereumAddress(),
    inReplyTo: generateHexString(64),
    contentHash: generateHexString(64),
    signature: generateHexString(256),
    uri: sample(prefabURLs),
  };
};

/**
 * generateReaction
 * @param from - a desired fromID (optional)
 */
export const generateReaction = (from?: EthereumAddress): BatchReactionMessage => {
  return {
    type: DSNPType.Reaction,
    fromId: from ? from : generateEthereumAddress(),
    emoji: generateHexString(20),
    inReplyTo: generateHexString(64),
    signature: generateHexString(256),
  };
};
