import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { BaseSchema } from "./base.schema";
import { Gender, Role } from "@app/enums";

@Schema({ timestamps: true })
export class User extends BaseSchema {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true, select: false })
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  birth: Date;

  @Prop({ unique: true, required: false })
  phone: string;

  @Prop()
  address: string[];

  @Prop()
  addressCode: string[];

  @Prop({ type: String, enum: Gender })
  gender: Gender;

  @Prop({ type: String, enum: Role, default: Role.CUSTOMER })
  role: Role;

  @Prop({ default: false })
  isLocked: boolean;

  @Prop({ type: Date })
  createAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
