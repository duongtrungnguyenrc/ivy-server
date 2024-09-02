import { Product } from "@app/schemas";
import { ApiResponseProperty } from "@nestjs/swagger";

export class UpdateProductResponse implements BaseResponse {
  @ApiResponseProperty({ type: () => Product })
  data: Product;

  @ApiResponseProperty()
  message: string;
}
