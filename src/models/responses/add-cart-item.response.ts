import { Cart } from "@app/schemas";
import { ApiResponseProperty } from "@nestjs/swagger";

export class AddCartItemResponse implements BaseResponse {
  @ApiResponseProperty()
  data: Cart;

  @ApiResponseProperty()
  message: string;
}
