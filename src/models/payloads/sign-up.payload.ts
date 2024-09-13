import { IsArray, IsEmail, IsEnum, IsMobilePhone, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { Gender } from "@app/enums";
import { User } from "@app/schemas";

export class SignUpPayload implements Partial<User> {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsMobilePhone()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsArray()
  address: string[];

  @ApiProperty()
  @IsArray()
  addressCode: string[];

  @ApiProperty()
  @IsEnum(Gender)
  gender: Gender;
}
