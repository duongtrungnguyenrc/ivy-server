import { ApiProperty } from "@nestjs/swagger";

export class DeleteProductPayload {
  @ApiProperty()
  id: string;
}
