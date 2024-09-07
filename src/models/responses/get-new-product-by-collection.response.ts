import { Product } from "@app/schemas";
import { ApiResponseProperty } from "@nestjs/swagger";

class GetProductsByCollectionResponseData {
  @ApiResponseProperty()
  products: Product[];

  @ApiResponseProperty()
  page: number;

  @ApiResponseProperty()
  limit: number;

  @ApiResponseProperty()
  totalPages: number;
}

export class GetProductsByCollectionResponse implements BaseResponse {
  @ApiResponseProperty()
  data: GetProductsByCollectionResponseData;

  @ApiResponseProperty()
  message: string;
}
