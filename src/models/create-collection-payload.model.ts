import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateCollectionPayload {
  @ApiProperty({ type: String })
  @IsString()
  groupId: string;

  @IsOptional()
  @IsBoolean()
  special: boolean;

  @ApiProperty()
  name: string;
}
