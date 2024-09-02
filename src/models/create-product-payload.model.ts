import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

class CreateOptionPayload {
  @ApiProperty()
  @IsString()
  colorHexCode: string;

  @ApiProperty()
  @IsArray()
  images: string[];
}

class CreateCostPayload {
  @ApiProperty()
  @IsNumber()
  ingredientPrice: number;

  @ApiProperty()
  @IsNumber()
  production_cost: number;

  @ApiProperty()
  @IsNumber()
  sale_cost: number;

  @ApiProperty()
  @IsNumber()
  discountPercentage: number;
}

export class CreateProductPayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  preserveDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  material: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  collectionId: string;

  @ApiProperty({ type: [CreateOptionPayload] })
  options: CreateOptionPayload[];

  @ApiProperty({ type: CreateCostPayload })
  cost: CreateCostPayload;
}
