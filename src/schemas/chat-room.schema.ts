import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

import { BaseSchema } from "./base.schema";
import { ChatMessage } from "./chat-message.schema";

@Schema({ timestamps: true })
export class ChatRoom extends BaseSchema {
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: [{ type: Types.ObjectId }], ref: "ChatMessage", default: [] })
  messages: ChatMessage[];

  @Prop({ type: Date })
  createdAt: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
