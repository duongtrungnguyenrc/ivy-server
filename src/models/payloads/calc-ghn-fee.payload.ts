import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";

export class CalcDeliveryFeePayload {
  @ApiProperty()
  @IsMongoId()
  orderID: string;
}
