import { ApiResponseProperty } from "@nestjs/swagger";

export class SignInResponse implements BaseResponse {
  @ApiResponseProperty()
  data: TokenPair;

  @ApiResponseProperty()
  message: string;
}
