import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsString } from "class-validator";

class CreateOptionPayload {
  @ApiProperty()
  @IsString()
  colorHexCode: string;

  @ApiProperty()
  @IsNumber()
  stock: number;
}

class CreateCostPayload {
  @ApiProperty()
  @IsNumber()
  ingredientCost: number;

  @ApiProperty()
  @IsNumber()
  productionCost: number;

  @ApiProperty()
  @IsNumber()
  saleCost: number;

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
  @IsNotEmpty()
  @IsString()
  preserveDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  material: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  collectionId: string;

  @ApiProperty()
  @IsArray()
  images: string[];

  @ApiProperty({ type: [CreateOptionPayload] })
  options: CreateOptionPayload[];

  @ApiProperty({ type: CreateCostPayload })
  cost: CreateCostPayload;
}
