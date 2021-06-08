import { BroadcastMessage, DSNPMessage, ReactionMessage, ReplyMessage, GraphChangeMessage } from "../messages/messages";

export interface BatchBroadcastMessage extends BroadcastMessage {
  signature: string;
}
export interface BatchReplyMessage extends ReplyMessage {
  signature: string;
}

export interface BatchReactionMessage extends ReactionMessage {
  signature: string;
}

export interface BatchGraphChangeMessage extends GraphChangeMessage {
  signature: string;
}

export interface DSNPBatchMessage extends DSNPMessage {
  signature: string;
}
