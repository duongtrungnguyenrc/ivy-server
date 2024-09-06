import { ApiResponseProperty } from "@nestjs/swagger";

import { Collection } from "@app/schemas";

export class GetCollectionResponse implements BaseResponse {
  @ApiResponseProperty()
  data: Collection;

  @ApiResponseProperty()
  message: string;
}
