import { IsEnum, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { OrderStatus } from "@app/enums";

export class UpdateOrderPayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty()
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
