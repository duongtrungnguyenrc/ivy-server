import { ApiResponseProperty } from "@nestjs/swagger";
import { Order } from "@app/schemas";

export class UpdateOrderResponse implements BaseResponse {
  @ApiResponseProperty()
  data: Order;

  @ApiResponseProperty()
  message: string;
}
