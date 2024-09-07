import { IsBoolean, IsMongoId, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCollectionGroupPayload {
  @ApiProperty({ type: String })
  @IsMongoId()
  categoryId: string;

  @IsBoolean()
  @IsOptional()
  special: boolean;

  @ApiProperty()
  name: string;
}
