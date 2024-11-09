import { IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { PaymentMethod } from "@app/enums";

export class ProcessOrderPayload {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  addressCode: Array<string>;

  @ApiProperty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
