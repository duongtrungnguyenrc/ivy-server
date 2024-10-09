import { IsString, IsNumber, IsOptional, Min, Max } from "class-validator";

export class CreateRatingPayload {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}
