import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsMongoId, IsOptional } from "class-validator";

export class CreateCollectionPayload {
  @ApiProperty({ type: String })
  @IsMongoId()
  groupId: string;

  @IsOptional()
  @IsBoolean()
  special: boolean;

  @ApiProperty()
  name: string;
}
