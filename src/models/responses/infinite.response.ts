import { ApiProperty } from "@nestjs/swagger";

export class InfiniteResponse<T> {
  @ApiProperty({
    description: "Cursor for the next page of results",
    required: false,
    type: Number,
  })
  nextCursor?: number;

  @ApiProperty({
    type: "array",
    items: { type: "object" },
    description: "Array of items",
  })
  data: T[];
}
