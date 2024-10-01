import { IsMongoId } from "class-validator";

export class CreateChatRoomPayload {
  @IsMongoId()
  customerId: string;
}
