import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { BaseSchema } from "./base.schema";
import { User } from "./user.schema";

@Schema({ timestamps: true })
export class AccessRecord extends BaseSchema {
  @Prop({ type: mongoose.Types.ObjectId, ref: "User" })
  user: User;

  @Prop()
  ipAddress: string;

  @Prop()
  deviceInfo: string;

  @Prop()
  browserInfo: string;

  @Prop({ type: Date })
  createdAt: Date | string;
}

export const AccessRecordSchema = SchemaFactory.createForClass(AccessRecord);
