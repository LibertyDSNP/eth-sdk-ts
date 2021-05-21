import * as fs from "fs";
import { times } from "lodash";

import { ActionType } from "../../batch/actionType";
import { Broadcast, GraphChange, KeyList, Message, Reaction, Reply } from "../../types/DSNP";
import { EthereumAddress } from "../../types/Strings";
import { randInt, generateHexString, sampleStr, sampleNum } from "@dsnp/test-generators/src/index";
import { generateEthereumAddress } from "@dsnp/test-generators/src/addresses";
import { prefabURLs } from "@dsnp/test-generators/src/sampleText";

/**
 * @function generateDSNPStream is meant to simulate incoming DSNP Messages of all kinds
 * it generates a randomized list of DSNP messages at an estimated frequency for each type.
 * @param messageCount
 */
export const generateDSNPStream = (messageCount: number): Array<Message> => {
  // A WAG of the ratios of message types
  const reactionReplyMax = 1000;
  const broadcastMax = Math.ceil(reactionReplyMax / 3);
  // const inboxMax = Math.ceil(broadcastMax / 5);
  const graphMax = Math.ceil(broadcastMax / 10);
  // const profileMax = Math.ceil(graphMax / 10);
  // const keyMax = Math.ceil(profileMax / 2);

  // this sets the frequency of generated types to approximately the ratios above
  const maxInt = reactionReplyMax * 10;

  const data: Message[] = [];
  times(messageCount, () => {
    const value = randInt(maxInt);
    let msg: Message;
    if (value > reactionReplyMax) {
      msg = value % 2 == 0 ? generateReaction() : generateReply();
    } else if (value > broadcastMax) {
      msg = generateBroadcast();
    } else if (value > graphMax) {
      msg = generateGraphChange();
    } else {
      msg = generateKeyList(); // stands in for combined frequency of all types of KeyList changes
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
export const writeFixture = (data: Array<Message>, jsonFilePath: string): number => {
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
export const generateBroadcast = (from?: EthereumAddress): Broadcast => {
  return {
    actionType: ActionType.Broadcast,
    fromAddress: from ? from : generateEthereumAddress(),
    messageID: generateHexString(64),
    uri: sampleStr(prefabURLs),
  };
};

/**
 * generateReply
 * @param from - a desired fromID (optional)
 */
export const generateReply = (from?: EthereumAddress): Reply => {
  return {
    actionType: ActionType.Reply,
    fromAddress: from ? from : generateEthereumAddress(),
    inReplyTo: generateHexString(64),
    messageID: generateHexString(64),
    uri: sampleStr(prefabURLs),
  };
};

/**
 * generateGraphChange
 * @param from - a desired fromID (optional)
 */
export const generateGraphChange = (from?: EthereumAddress): GraphChange => {
  const val: 0 | 1 = sampleNum([0, 1]) === 0 ? 0 : 1;
  return {
    actionType: ActionType.GraphChange,
    fromAddress: from ? from : generateEthereumAddress(),
    followType: val,
  };
};

/**
 * generateKeyList
 * @param from - a desired fromID (optional)
 */
export const generateKeyList = (from?: EthereumAddress): KeyList => {
  return {
    actionType: ActionType.KeyList,
    fromAddress: from ? from : generateEthereumAddress(),
    keyList: [generateHexString(64), generateHexString(64), generateHexString(64)],
  };
};

/**
 * generateProfile
 * @param from - a desired fromID (optional)
 */

/**
 * generateReaction
 * @param from - a desired fromID (optional)
 */
export const generateReaction = (from?: EthereumAddress): Reaction => {
  return {
    actionType: ActionType.Reaction,
    fromAddress: from ? from : generateEthereumAddress(),
    inReplyTo: generateHexString(64),
    emoji: generateHexString(20),
  };
};
