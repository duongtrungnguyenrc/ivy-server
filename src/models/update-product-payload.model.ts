import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

class UpdateOptionPayload {
  @ApiProperty()
  @IsString()
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
  @IsString()
  id: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  ingredientPrice?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  production_cost?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  sale_cost?: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  discountPercentage?: number;
}

export class UpdateProductPayload {
  @ApiProperty()
  @IsString()
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
