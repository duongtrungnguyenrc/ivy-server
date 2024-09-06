import { ApiResponseProperty } from "@nestjs/swagger";

export class ResetPasswordResponse implements BaseResponse {
  @ApiResponseProperty()
  data: boolean;

  @ApiResponseProperty()
  message: string;
}
