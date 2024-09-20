import { ApiResponseProperty } from "@nestjs/swagger";

import { AccessRecord } from "@app/schemas";

export class GetAccessHistoryResponse {
  @ApiResponseProperty()
  accessRecords: AccessRecord[];

  @ApiResponseProperty()
  page: number;

  @ApiResponseProperty()
  limit: number;

  @ApiResponseProperty()
  totalPages: number;
}
