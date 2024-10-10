import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsMongoId, IsOptional } from "class-validator";

export class UpdateCollectionGroupPayload {
  @ApiProperty()
  @IsMongoId()
  _id: string;

  @IsBoolean()
  @IsOptional()
  special?: boolean;

  @ApiProperty()
  @IsOptional()
  name?: string;

  @ApiProperty({ type: Array })
  @IsArray()
  @IsOptional()
  collections?: string[];
}
