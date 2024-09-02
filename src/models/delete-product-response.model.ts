import { ApiResponseProperty } from "@nestjs/swagger";

export class DeleteProductResponse implements BaseResponse {
  @ApiResponseProperty()
  data: boolean;

  @ApiResponseProperty()
  message: string;
}
