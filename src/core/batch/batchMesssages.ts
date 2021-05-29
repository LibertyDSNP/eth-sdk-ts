import { BroadcastMessage, ReactionMessage, ReplyMessage } from "../messages/messages";

export interface BatchBroadcastMessage extends BroadcastMessage {
  signature: string;
}
export interface BatchReplyMessage extends ReplyMessage {
  signature: string;
}

export interface BatchReactionMessage extends ReactionMessage {
  signature: string;
}

export type DSNPBatchMessage = BatchBroadcastMessage | BatchReplyMessage | BatchReactionMessage;
