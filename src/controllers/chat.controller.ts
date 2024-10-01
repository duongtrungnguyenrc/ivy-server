import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
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
  async createRoom(@AuthUid() customerId?: string) {
    return await this.chatService.loadChatRoom(customerId);
  }

  @Get("/")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBearerAuth()
  async getRooms(@Pagination() pagination: Pagination) {
    return this.chatService.getChatRooms(pagination);
  }

  @Get("/messages/:id")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBearerAuth()
  async getRoomMessages(@Param("id") roomId: string, @Pagination() pagination: Pagination): Promise<ChatMessage[]> {
    return await this.chatService.getRoomMessages(roomId, pagination);
  }
}
