import { ApiResponseProperty } from "@nestjs/swagger";

import { Group } from "@app/schemas";

export class GetGroupResponse implements BaseResponse {
  @ApiResponseProperty()
  data: Group;

  @ApiResponseProperty()
  message: string;
}
