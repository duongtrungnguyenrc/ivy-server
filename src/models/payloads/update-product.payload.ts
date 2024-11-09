import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Size } from "@app/enums";

class UpdateOptionPayload {
  @ApiProperty({ description: "Unique identifier of the option" })
  @IsMongoId()
  @IsOptional()
  _id?: string;

  @ApiProperty({ description: "Hexadecimal color code for the option" })
  @IsOptional()
  @IsString()
  colorHexCode?: string;

  @ApiProperty({ description: "Name of the color for the option" })
  @IsOptional()
  @IsString()
  colorName?: string;

  @ApiProperty({ description: "Current stock quantity for the option" })
  @IsOptional()
  @IsNumber()
  stock?: number;

  @ApiProperty({ description: "Size of the option" })
  @IsOptional()
  @IsString()
  size?: string;
}

class CreateOptionPayload {
  @ApiProperty({ description: "Hexadecimal color code for the new option" })
  @IsString()
  @IsNotEmpty({ message: "Color hex code cannot be empty" })
  colorHexCode: string;

  @ApiProperty({ description: "Name of the color for the new option" })
  @IsString()
  @IsNotEmpty({ message: "Color name cannot be empty" })
  colorName: string;

  @ApiProperty({ description: "Size of the new option" })
  @IsEnum(Size)
  @IsNotEmpty({ message: "Size cannot be empty" })
  size: Size;

  @ApiProperty({ description: "Initial stock quantity for the new option" })
  @IsNumber()
  @IsNotEmpty({ message: "Stock quantity cannot be empty" })
  stock: number;
}

class UpdateCostPayload {
  @ApiProperty({ description: "Unique identifier of the cost data" })
  @IsOptional()
  @IsMongoId()
  _id?: string;

  @ApiProperty({ description: "Cost of ingredients for the product" })
  @IsOptional()
  @IsNumber()
  ingredientCost?: number;

  @ApiProperty({ description: "Production cost of the product" })
  @IsOptional()
  @IsNumber()
  productionCost?: number;

  @ApiProperty({ description: "Sales price of the product" })
  @IsOptional()
  @IsNumber()
  saleCost?: number;

  @ApiProperty({ description: "Discount percentage for the product" })
  @IsOptional()
  @IsNumber()
  discountPercentage?: number;
}

export class UpdateProductPayload {
  @ApiProperty({ description: "Name of the product" })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: "Description of the product" })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "Array of new image URLs to add to the product" })
  @IsOptional()
  @IsArray()
  newImages?: string[];

  @ApiProperty({ description: "Array of image URLs to delete from the product" })
  @IsOptional()
  @IsArray()
  deleteImages?: string[];

  @ApiProperty({ description: "Preservation instructions for the product" })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  preserveDescription?: string;

  @ApiProperty({ description: "Material of the product" })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  material?: string;

  @ApiProperty({ description: "Array of options to update for the product", type: [UpdateOptionPayload] })
  @IsOptional()
  @IsArray()
  updateOptions?: UpdateOptionPayload[];

  @ApiProperty({ description: "Array of new options to add to the product", type: [CreateOptionPayload] })
  @IsOptional()
  @IsArray()
  newOptions?: CreateOptionPayload[];

  @ApiProperty({ description: "Array of option IDs to delete from the product" })
  @IsOptional()
  @IsArray()
  deleteOptions?: string[];

  @ApiProperty({ description: "Cost details to update for the product", type: UpdateCostPayload })
  @IsOptional()
  @IsObject()
  newCost?: UpdateCostPayload;
}
