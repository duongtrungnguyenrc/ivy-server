import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

import { BaseSchema } from "./base.schema";
import { User } from "./user.schema";

@Schema({ timestamps: true })
export class ChatRoom extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: "User", required: false })
  customer: User;

  @Prop({ type: [{ type: Types.ObjectId }], ref: "ChatMessage", default: [] })
  messages: string;

  @Prop({ type: Date })
  createAt: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
