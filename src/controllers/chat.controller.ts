import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { ChatService } from "@app/services";
import { HasRole, Pagination } from "@app/decorators";
import { JWTAccessAuthGuard } from "@app/guards";
import { ChatMessage } from "@app/schemas";
import { LoadChatRoomQuery } from "@app/models";

@Controller("chat")
@ApiTags("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("/")
  async loadRoom(@Query() query: LoadChatRoomQuery) {
    return await this.chatService.loadChatRoom(query.email);
  }

  @Get("/")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBearerAuth()
  async getRooms(@Pagination() pagination: Pagination) {
    return await this.chatService.getChatRooms(pagination);
  }

  @Get("/messages/:email")
  @UseGuards(JWTAccessAuthGuard)
  @ApiBearerAuth()
  async getRoomMessages(@Param("email") email: string, @Pagination() pagination: Pagination): Promise<ChatMessage[]> {
    return await this.chatService.getRoomMessages(email, pagination);
  }
}
