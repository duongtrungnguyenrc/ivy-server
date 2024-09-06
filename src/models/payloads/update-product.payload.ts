import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

class UpdateOptionPayload {
  @ApiProperty()
  @IsMongoId()
  id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  colorHexCode?: string;

  @ApiProperty()
  @IsArray()
  images?: string[];
}

class UpdateCostPayload {
  @ApiProperty()
  @IsMongoId()
  id: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  ingredientCost?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  productionCost?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  saleCost?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  discountPercentage?: number;
}

export class UpdateProductPayload {
  @ApiProperty()
  @IsMongoId()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  preserveDescription?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  material?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  collectionId?: string;

  @ApiProperty({ type: [UpdateOptionPayload] })
  @IsArray()
  options?: UpdateOptionPayload[];

  @ApiProperty({ type: UpdateCostPayload })
  @IsObject()
  cost?: UpdateCostPayload;
}
