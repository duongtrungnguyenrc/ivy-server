import { DeliveryMethod } from "@app/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, Max, Min } from "class-validator";

export class CalcDeliveryFeePayload {
  @ApiProperty()
  @IsEnum(DeliveryMethod)
  service: DeliveryMethod;

  @ApiProperty()
  @IsArray()
  toAddress: string[];

  @ApiProperty()
  @IsArray()
  toAddressCode: string[];

  @Max(5000000)
  @Min(0)
  cost: number;
}
