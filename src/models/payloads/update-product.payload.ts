import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

class UpdateOptionPayload {
  @ApiProperty()
  @IsMongoId()
  _id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  colorHexCode?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  colorName?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  size?: string;
}

class UpdateCostPayload {
  @ApiProperty()
  @IsMongoId()
  _id: string;

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
  @IsArray()
  images?: string[];

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
  @IsOptional()
  @IsArray()
  options?: UpdateOptionPayload[];

  @ApiProperty({ type: UpdateCostPayload })
  @IsOptional()
  @IsObject()
  cost?: UpdateCostPayload;
}
