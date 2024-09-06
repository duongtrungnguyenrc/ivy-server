import { ApiResponseProperty } from "@nestjs/swagger";

import { Product } from "@app/schemas";

export class CreateProductResponse implements BaseResponse {
  @ApiResponseProperty({ type: String })
  data: Product;

  @ApiResponseProperty()
  message: string;
}
