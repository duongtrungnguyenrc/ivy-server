import { IsArray, IsDateString, IsEnum, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { Gender } from "@app/enums";

export class UpdateUserPayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsDateString()
  @IsOptional()
  birth?: Date;

  @ApiProperty()
  @IsPhoneNumber("VN")
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  address?: string[];

  @ApiProperty()
  @IsArray()
  @IsOptional()
  addressCode?: string[];
}
