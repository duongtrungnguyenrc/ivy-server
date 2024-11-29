import { Product } from "@app/schemas";
import { ApiResponseProperty } from "@nestjs/swagger";

export class TopProductsResponse {
  @ApiResponseProperty({ type: String, example: "Men" })
  category: string;

  @ApiResponseProperty({
    type: [Product],
  })
  topProducts: Product[];
}
