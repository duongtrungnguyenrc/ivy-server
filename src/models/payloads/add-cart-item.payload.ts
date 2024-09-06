import { IsMongoId, IsNotEmpty, IsNumber, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AddCartItemPayload {
  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  productId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMongoId()
  optionId: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  quantity: number;
}
