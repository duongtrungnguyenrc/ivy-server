import { ApiResponseProperty } from "@nestjs/swagger";

export class ForgotPasswordResponse implements BaseResponse {
  @ApiResponseProperty()
  data: boolean;

  @ApiResponseProperty()
  message: string;
}
