import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class CreateMessagePayload {
  @IsMongoId()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
