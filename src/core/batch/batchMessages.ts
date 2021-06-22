import {
  BroadcastMessage,
  DSNPMessage,
  GraphChangeMessage,
  ProfileMessage,
  ReactionMessage,
  ReplyMessage,
} from "../messages";

export type DSNPMessageSigned<T extends DSNPMessage> = T & { signature: string };

export type DSNPBatchMessage = DSNPMessageSigned<DSNPMessage>;

export type BatchBroadcastMessage = DSNPMessageSigned<BroadcastMessage>;
export type BatchReplyMessage = DSNPMessageSigned<ReplyMessage>;
export type BatchReactionMessage = DSNPMessageSigned<ReactionMessage>;
export type BatchProfileMessage = DSNPMessageSigned<ProfileMessage>;
export type BatchGraphChangeMessage = DSNPMessageSigned<GraphChangeMessage>;
