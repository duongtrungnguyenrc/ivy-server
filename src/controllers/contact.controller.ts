import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

import { LoadChatRoomQuery, SendEmailPayload } from "@app/models";
import { ChatMessage, ChatRoom } from "@app/schemas";
import { Auth, Pagination } from "@app/decorators";
import { ContactService } from "@app/services";

@Controller("contact")
@ApiTags("contact")
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post("/")
  async loadRoom(@Query() query: LoadChatRoomQuery) {
    return await this.contactService.getOrCreateRoom(query.email);
  }

  @Get("/")
  @Auth(["ADMIN"])
  async getRooms(@Pagination() pagination: Pagination): Promise<InfiniteResponse<ChatRoom>> {
    return await this.contactService.getChatRooms(pagination);
  }

  @Get("/messages/:email")
  @Auth()
  async getRoomMessages(
    @Param("email") email: string,
    @Pagination() pagination: Pagination,
  ): Promise<InfiniteResponse<ChatMessage>> {
    return await this.contactService.getRoomMessages(email, pagination);
  }

  @Post("/email")
  @Auth(["ADMIN"])
  async sendEmail(@Body() payload: SendEmailPayload): Promise<void> {
    return this.contactService.sendEmail(payload);
  }
}
