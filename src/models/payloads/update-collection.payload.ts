import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateCollectionPayload {
  @IsOptional()
  @IsBoolean()
  special?: boolean;

  @ApiProperty()
  name?: string;
}
