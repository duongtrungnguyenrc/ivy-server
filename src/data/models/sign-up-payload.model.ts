import { IsEmail, IsNotEmpty } from "class-validator";

export class SignUpPayload {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  password: string;
}
