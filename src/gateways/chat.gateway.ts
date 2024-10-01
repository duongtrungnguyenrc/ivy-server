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
import { SocketAuthUid } from "@app/decorators";
import { SocketJWTAccessAuthGuard } from "@app/guards";
import { UseGuards, Logger } from "@nestjs/common";
import { ChatRoom, ChatMessage } from "@app/schemas";
import { CreateMessagePayload } from "@app/models";

@WebSocketGateway(80, { namespace: "chat" })
@UseGuards(SocketJWTAccessAuthGuard)
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
      this.logger.error(`Error onJoinRoom: ${error.message}`);
      this.server.emit("error", "Could not join the room");
    }
  }

  @SubscribeMessage("send")
  async onSendMessage(@MessageBody() payload: CreateMessagePayload, @SocketAuthUid() userId: string) {
    try {
      const message: ChatMessage = await this.chatService.createMessage(userId, payload);

      this.server.to(payload.roomId).emit("message", message);
      this.logger.log(`Client ${userId} sent message to room ${payload.roomId}`);
    } catch (error) {
      this.logger.error(`Error onSendMessage: ${error.message}`);
      this.server.emit("error", "Could not join send message");
    }
  }
}
