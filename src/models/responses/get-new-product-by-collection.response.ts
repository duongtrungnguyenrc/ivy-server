import { ApiResponseProperty } from "@nestjs/swagger";

import { Product } from "@app/schemas";

export class GetProductsByCollectionResponse {
  @ApiResponseProperty()
  products: Product[];

  @ApiResponseProperty()
  page: number;

  @ApiResponseProperty()
  limit: number;

  @ApiResponseProperty()
  totalPages: number;
}
