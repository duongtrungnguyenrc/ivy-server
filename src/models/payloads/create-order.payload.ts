import { IsMongoId, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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
  @ApiProperty({ type: [OrderItem] })
  items: OrderItem[];
}
