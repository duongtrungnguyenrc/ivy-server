import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ChatTypingPayload {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  room: string;
}
