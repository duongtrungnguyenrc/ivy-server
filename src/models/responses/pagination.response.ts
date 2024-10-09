import { ApiProperty } from "@nestjs/swagger";

export class PaginationMeta {
  @ApiProperty({ description: "Total number of pages" })
  pages: number;

  @ApiProperty({ description: "Current page number" })
  page: number;

  @ApiProperty({ description: "Number of items per page" })
  limit: number;
}

export class PaginationResponse<T> {
  @ApiProperty({
    type: PaginationMeta,
    description: "Meta information about pagination",
  })
  meta: PaginationMeta;

  @ApiProperty({
    type: "array",
    items: { type: "object" },
    description: "Array of rating objects",
  })
  data: T[];
}
