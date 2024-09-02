import { ApiResponseProperty } from "@nestjs/swagger";

export class SignOutResponse implements BaseResponse {
  @ApiResponseProperty()
  data: boolean;

  @ApiResponseProperty()
  message: string;
}
