import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

import { BaseSchema } from "./base.schema";
import { User } from "./user.schema";

@Schema({ timestamps: true })
export class ChatMessage extends BaseSchema {
  @Prop({ type: Types.ObjectId, ref: "User", required: false })
  sender: User;

  @Prop()
  message: string;

  @Prop({ type: Date })
  createAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
