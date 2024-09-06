import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

import { ProductCategory } from "@app/enums";

export class CreateGroupPayload {
  @ApiProperty({ type: String })
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsBoolean()
  @IsOptional()
  special: boolean;

  @ApiProperty()
  name: string;
}
