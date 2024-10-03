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
import { Logger, UsePipes, ValidationPipe } from "@nestjs/common";

import { ChatService } from "@app/services";
import { SocketAuthUid } from "@app/decorators";
import { ChatRoom, ChatMessage } from "@app/schemas";
import { CreateMessagePayload } from "@app/models";

@WebSocketGateway({ namespace: "chat", crossOriginIsolated: false })
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

  @SubscribeMessage("join")
  async onJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() roomId: string) {
    try {
      const room: ChatRoom = await this.chatService.loadRoom(roomId);

      client.join(room._id.toString());
      this.logger.log(`Client ${client.id} joined room ${room._id}`);

      this.server.to(room._id).emit("joined", room);
    } catch (error) {
      this.server.emit("error", "Could not join the room");
    }
  }

  @SubscribeMessage("send")
  async onSendMessage(@MessageBody() payload: CreateMessagePayload, @SocketAuthUid() userId: string) {
    try {
      const createdMessage: ChatMessage = await this.chatService.createMessage(userId, payload);

      this.server.to(payload.roomId).emit("message", createdMessage);
    } catch (error) {
      this.logger.error(`Error onSendMessage: ${error.message}`);
    }
  }

  @SubscribeMessage("typing")
  async onTyping(@MessageBody() roomId: string, @SocketAuthUid() userId: string) {
    try {
      this.server.to(roomId).emit("typing", userId);
    } catch (error) {
      this.server.emit("error", "Could not notify typing event");
    }
  }

  @SubscribeMessage("stop-typing")
  async onStopTyping(@MessageBody() roomId: string, @SocketAuthUid() userId: string) {
    try {
      this.server.to(roomId).emit("stop-typing", userId);
    } catch (error) {
      this.server.emit("error", "Could not notify stop-typing event");
    }
  }
}
