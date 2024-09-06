import { User } from "@app/schemas";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsMongoId, IsOptional } from "class-validator";

export class ForgotPasswordPayload implements Partial<User> {
  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsMongoId()
  @IsOptional()
  id?: string;
}
