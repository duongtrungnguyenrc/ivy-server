import { IsEmail, IsEnum, IsMobilePhone, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { Gender } from "@app/enums";
import { User } from "@app/schemas";

export class SignUpPayload implements Partial<User> {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsMobilePhone()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsEnum(Gender)
  gender: Gender;
}
