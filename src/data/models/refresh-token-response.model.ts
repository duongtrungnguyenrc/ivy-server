import { ApiResponseProperty } from "@nestjs/swagger";

export class RefreshTokenResponse implements BaseResponse {
  @ApiResponseProperty()
  data: TokenPair;

  @ApiResponseProperty()
  message: string;
}
