import { IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderPayload {
  @ApiProperty({ type: [String] })
  @IsArray()
  items: string[];
}
