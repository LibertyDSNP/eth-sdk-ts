import { generateBroadcast, generateReply, generateReaction } from "./dsnpGenerators";
import { EthereumAddress } from "../types/Strings";
import { BatchBroadcastMessage, BatchReactionMessage, BatchReplyMessage } from "../core/batch/batchMessages";
import { generateHexString } from "@dsnp/test-generators";

export type DSNPBatchWriteResult = {
  records: number;
  path: string | undefined;
  error: string;
};

export type BatchMessageType = BatchBroadcastMessage | BatchReactionMessage | BatchReplyMessage;

/**
 * generateBatchBroadcast
 *
 * @param from - a desired fromID (optional)
 */
export const generateBatchBroadcast = (from?: EthereumAddress): BatchBroadcastMessage => {
  return { signature: generateHexString(256), ...generateBroadcast(from) };
};

export const generateBatchReaction = (from?: EthereumAddress): BatchReactionMessage => {
  return { signature: generateHexString(256), ...generateReaction(from) };
};

export const generateBatchReply = (from?: EthereumAddress): BatchReplyMessage => {
  return { signature: generateHexString(256), ...generateReply(from) };
};
