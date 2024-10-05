import { IsEmail } from "class-validator";

export class LoadChatRoomQuery {
  @IsEmail()
  email: string;
}
