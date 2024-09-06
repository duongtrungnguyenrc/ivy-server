import { Group } from "@app/schemas";
import { ApiResponseProperty } from "@nestjs/swagger";

export class UpdateGroupResponse implements BaseResponse {
  @ApiResponseProperty()
  data: Group;

  @ApiResponseProperty()
  message: string;
}
