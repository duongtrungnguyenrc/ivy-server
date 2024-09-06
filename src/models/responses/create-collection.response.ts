import { ApiResponseProperty } from "@nestjs/swagger";

import { Collection } from "@app/schemas";

export class CreateCollectionResponse implements BaseResponse {
  @ApiResponseProperty({ type: String })
  data: Collection;

  @ApiResponseProperty()
  message: string;
}
