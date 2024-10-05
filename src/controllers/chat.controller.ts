import { Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { ChatService } from "@app/services";
import { AuthUid, HasRole, Pagination } from "@app/decorators";
import { JWTAccessAuthGuard } from "@app/guards";
import { ChatMessage } from "@app/schemas";

@Controller("chat")
@ApiTags("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post("/")
  async loadRoom(@AuthUid() customerId?: string, @Query("room") roomId?: string) {
    return await this.chatService.loadChatRoom(customerId, roomId);
  }

  @Get("/")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBearerAuth()
  async getRooms(@Pagination() pagination: Pagination) {
    return await this.chatService.getChatRooms(pagination);
  }

  @Get("/messages/:id")
  @UseGuards(JWTAccessAuthGuard)
  @ApiBearerAuth()
  async getRoomMessages(@Param("id") roomId: string, @Pagination() pagination: Pagination): Promise<ChatMessage[]> {
    return await this.chatService.getRoomMessages(roomId, pagination);
  }
}
