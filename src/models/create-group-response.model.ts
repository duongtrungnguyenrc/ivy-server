import { ApiResponseProperty } from "@nestjs/swagger";

import { Group } from "@app/schemas";

export class CreateGroupResponse implements BaseResponse {
  @ApiResponseProperty({ type: String })
  data: Group;

  @ApiResponseProperty()
  message: string;
}
