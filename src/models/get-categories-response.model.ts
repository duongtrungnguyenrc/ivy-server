import { ProductCategory } from "@app/enums";
import { Group } from "@app/schemas";
import { ApiResponseProperty } from "@nestjs/swagger";

class GetCategoriesResponseData {
  @ApiResponseProperty({ type: String })
  name: ProductCategory;

  @ApiResponseProperty()
  groups: Group[];
}

export class GetCategoriesResponse implements BaseResponse {
  @ApiResponseProperty()
  data: GetCategoriesResponseData[];

  @ApiResponseProperty()
  message: string;
}
