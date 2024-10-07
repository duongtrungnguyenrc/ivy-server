import { User } from "@app/schemas";
import { ApiResponseProperty } from "@nestjs/swagger";

export class GetUserResponse implements PaginationResponse<User> {
  @ApiResponseProperty()
  meta: {
    pages: number;
    page: number;
    limit: number;
  };

  @ApiResponseProperty()
  data: User[];
}
