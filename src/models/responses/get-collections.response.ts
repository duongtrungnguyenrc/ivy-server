import { ApiResponseProperty } from "@nestjs/swagger";

import { Collection } from "@app/schemas";

export class GetCollectionsResponse implements BaseResponse {
  @ApiResponseProperty()
  data: Collection[];

  @ApiResponseProperty()
  message: string;
}
