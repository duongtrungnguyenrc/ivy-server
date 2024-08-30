import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Gender } from "@app/data";
import { BaseSchema } from "./base.schema";

@Schema()
export class User extends BaseSchema {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true, select: false })
  password: string;

  @Prop()
  name: string;

  @Prop({ unique: true, required: false })
  phone: string;

  @Prop()
  addess: string;

  @Prop({ type: String, enum: Gender })
  gender: Gender;
}

export const UserSchema = SchemaFactory.createForClass(User);
