import { Order } from "@app/schemas";
import { ApiResponseProperty } from "@nestjs/swagger";

export class CreateOrderResponse implements BaseResponse {
  @ApiResponseProperty()
  data: Order;

  @ApiResponseProperty()
  message: string;
}
