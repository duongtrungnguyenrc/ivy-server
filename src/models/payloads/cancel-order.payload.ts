import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CancelOrderPayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  reason: string;
}
