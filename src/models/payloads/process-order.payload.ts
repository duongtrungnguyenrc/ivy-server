import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { PaymentMethod } from "@app/enums";

export class ProcessOrderPayload {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
