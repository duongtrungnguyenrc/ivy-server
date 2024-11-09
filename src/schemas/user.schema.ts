import { Schema, SchemaFactory } from "@nestjs/mongoose";

import { BaseSchema } from "./base.schema";
import { Gender, Role } from "@app/enums";
import { ApiSchemaProp } from "@app/decorators/api-schema-prop.decorator";

@Schema()
export class User extends BaseSchema {
  @ApiSchemaProp({ required: true, unique: true })
  email: string;

  @ApiSchemaProp({ type: String, required: true, select: false })
  password: string;

  @ApiSchemaProp()
  firstName: string;

  @ApiSchemaProp()
  lastName: string;

  @ApiSchemaProp()
  birth: Date;

  @ApiSchemaProp({ unique: true, required: false })
  phone: string;

  @ApiSchemaProp()
  address: string[];

  @ApiSchemaProp()
  addressCode: string[];

  @ApiSchemaProp({ type: String, enum: Gender })
  gender: Gender;

  @ApiSchemaProp({ type: String, enum: Role, default: Role.USER })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
