import { ApiResponseProperty } from "@nestjs/swagger";

export class SignUpResponse implements BaseResponse {
  @ApiResponseProperty()
  data: boolean;

  @ApiResponseProperty()
  message: string;
}
