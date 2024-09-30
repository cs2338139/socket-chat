import { SocketID, MessageContent, MessageID } from "@interfaces";
export interface Message {
  socketId: SocketID;
  message: MessageContent;
  isSending?: boolean;
  messageId?: MessageID;
}
