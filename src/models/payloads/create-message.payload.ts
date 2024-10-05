import { Role } from "@app/enums";
import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMessagePayload {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  from?: Role;

  @IsString()
  @IsNotEmpty()
  message: string;
}
