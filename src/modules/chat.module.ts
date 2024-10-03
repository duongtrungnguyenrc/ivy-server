import { ChatMessage, ChatMessageSchema, ChatRoom, ChatRoomSchema } from "@app/schemas";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { ChatGateway } from "@app/gateways";
import { ChatService } from "@app/services";
import { ChatController } from "@app/controllers";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ChatRoom.name,
        schema: ChatRoomSchema,
      },
      {
        name: ChatMessage.name,
        schema: ChatMessageSchema,
      },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
