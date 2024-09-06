import { ApiResponseProperty } from "@nestjs/swagger";

import { Group } from "@app/schemas";

export class GetGroupsResponse implements BaseResponse {
  @ApiResponseProperty()
  data: Group[];

  @ApiResponseProperty()
  message: string;
}
