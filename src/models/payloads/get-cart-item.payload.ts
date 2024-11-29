import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsOptional } from "class-validator";

export class getCartItemPayload {
  @ApiProperty()
  @IsArray()
  @IsOptional()
  ids: string[];
}
