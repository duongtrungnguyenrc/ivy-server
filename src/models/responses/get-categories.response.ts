import { ApiResponseProperty } from "@nestjs/swagger";
import { ProductCategory } from "@app/enums";
import { Group } from "@app/schemas";

export class GetCategoriesResponse {
  @ApiResponseProperty({ type: String })
  name: ProductCategory;

  @ApiResponseProperty()
  groups: Group[];
}
