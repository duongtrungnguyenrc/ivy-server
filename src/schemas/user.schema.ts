import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { BaseSchema } from "./base.schema";
import { Gender, Role } from "@app/enums";

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
  address: string;

  @Prop({ type: String, enum: Gender })
  gender: Gender;

  @Prop({ type: String, enum: Role, default: Role.USER })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
