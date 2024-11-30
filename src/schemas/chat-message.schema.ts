import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { BaseSchema } from "./base.schema";
import { Role } from "@app/enums";

@Schema({ timestamps: true })
export class ChatMessage extends BaseSchema {
  @Prop({ type: String, enum: Role, default: Role.CUSTOMER })
  from: Role;

  @Prop()
  message: string;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
