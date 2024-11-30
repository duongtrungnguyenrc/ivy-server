import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CancelOrderPayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  reason: string;

  @ApiProperty()
  @IsBoolean()
  accept: boolean;
}
