import { ChatMessage, ChatMessageSchema, ChatRoom, ChatRoomSchema } from "@app/schemas";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { ChatGateway } from "@app/gateways";
import { ContactService } from "@app/services";
import { ContactController } from "@app/controllers";
import { MailModule } from "./mailer.module";

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
    MailModule,
  ],
  controllers: [ContactController],
  providers: [ChatGateway, ContactService],
})
export class ContactModule {}
