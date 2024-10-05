import { Logger, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";

import { ChatService } from "@app/services";
import { ChatMessage } from "@app/schemas";
import { ChatTypingPayload, CreateMessagePayload } from "@app/models";
import { ChatEvent, ErrorMessage, Role } from "@app/enums";
import { SocketJWTAccessAuthGuard } from "@app/guards";
import { CHAT_ADMIN_ROOM_ID } from "@app/constants";

@WebSocketGateway({ namespace: "chat" })
@UsePipes(ValidationPipe)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;
  private readonly logger: Logger = new Logger("ChatGateway");

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage(ChatEvent.JOIN_ADMIN)
  @UseGuards(SocketJWTAccessAuthGuard)
  async onJoinAdminRoom(@ConnectedSocket() client: Socket) {
    await client.join(CHAT_ADMIN_ROOM_ID);
  }

  @SubscribeMessage(ChatEvent.JOIN)
  async onJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() email: string) {
    try {
      const room = await this.chatService.loadRoom(email);

      if (!room) {
        return this.server.emit(ChatEvent.ERROR, ErrorMessage.ROOM_NOT_FOUND);
      }

      await client.join(email);
      this.server.to(email).emit(ChatEvent.JOINED, room.email);

      this.logger.log(`Client ${client.id} joined room ${email}`);
    } catch (error) {
      this.server.emit(ChatEvent.ERROR, "Could not join the room");
      this.logger.error(`Error onJoinRoom: ${error.message}`);
    }
  }

  @SubscribeMessage(ChatEvent.SEND_MESSAGE)
  async onSendMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: CreateMessagePayload) {
    try {
      const isClientInAdminRoom = await this.isClientInAdminRoom(client.id);

      if (payload.from === Role.ADMIN && !isClientInAdminRoom) return;

      const role = isClientInAdminRoom ? Role.ADMIN : Role.USER;
      const createdMessage = await this.chatService.createMessage({ ...payload, from: role });

      if (role === Role.ADMIN) {
        this.server
          .to(CHAT_ADMIN_ROOM_ID)
          .emit(ChatEvent.ADMIN_MESSAGE, { room: payload.email, message: createdMessage });
      }

      this.broadcastMessage(payload.email, createdMessage, role);
    } catch (error) {
      this.logger.error(`Error onSendMessage: ${error.message}`);
      this.server.emit(ChatEvent.ERROR, "Could not send the message");
    }
  }

  @SubscribeMessage(ChatEvent.TYPING)
  async onTyping(@MessageBody() payload: ChatTypingPayload) {
    this.server.to(payload.room).emit(ChatEvent.TYPING, payload.email);
  }

  @SubscribeMessage(ChatEvent.STOP_TYPING)
  async onStopTyping(@MessageBody() payload: ChatTypingPayload) {
    this.server.to(payload.room).emit(ChatEvent.STOP_TYPING, payload.email);
  }

  private async isClientInAdminRoom(clientId: string): Promise<boolean> {
    const clientsInAdminRoom = await this.server.in(CHAT_ADMIN_ROOM_ID).fetchSockets();
    return clientsInAdminRoom.some((socket) => socket.id === clientId);
  }

  private broadcastMessage(room: string, message: ChatMessage, role: Role) {
    if (role != Role.ADMIN) {
      this.server.to(CHAT_ADMIN_ROOM_ID).emit(ChatEvent.ADMIN_MESSAGE, { room, message });
    }

    this.server.to(room).emit(ChatEvent.MESSAGE, message);
  }
}
