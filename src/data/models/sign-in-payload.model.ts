import { IsEmail, IsNotEmpty } from "class-validator";

export class SignInPayload {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
