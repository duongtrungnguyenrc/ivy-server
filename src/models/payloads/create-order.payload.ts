import { IsEnum, IsMongoId, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { PaymentMethod } from "@app/enums";

class OrderItem {
  @ApiProperty()
  @IsMongoId()
  productId: string;

  @ApiProperty()
  @IsMongoId()
  optionId: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

export class CreateOrderPayload {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ type: [OrderItem] })
  items: OrderItem[];

  @ApiProperty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}
