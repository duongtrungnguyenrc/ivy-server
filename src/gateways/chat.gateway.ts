import { Logger, UsePipes, ValidationPipe } from "@nestjs/common";
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

import { ChatEvent, ErrorMessage, MailSubject, Role } from "@app/enums";
import { ChatTypingPayload, CreateMessagePayload } from "@app/models";
import { MailerService } from "@nestjs-modules/mailer";
import { CHAT_ADMIN_ROOM_ID } from "@app/constants";
import { JWTSocketAuthGuard } from "@app/guards";
import { ContactService } from "@app/services";
import { ChatMessage } from "@app/schemas";
import { Auth } from "@app/decorators";

@WebSocketGateway({ namespace: "chat" })
@UsePipes(ValidationPipe)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;
  private readonly logger: Logger = new Logger(ChatGateway.name);

  constructor(
    private readonly contactService: ContactService,
    private readonly mailerService: MailerService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage(ChatEvent.JOIN_ADMIN)
  @Auth(["ADMIN"], JWTSocketAuthGuard)
  async onJoinAdminRoom(@ConnectedSocket() client: Socket) {
    await client.join(CHAT_ADMIN_ROOM_ID);
    client.emit(ChatEvent.JOINED_ADMIN);
    this.logger.log(`Client ${client.id} joined admin room`);
  }

  @SubscribeMessage(ChatEvent.JOIN)
  async onJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() email: string) {
    try {
      const room = await this.contactService.loadRoom(email);

      if (!room) {
        return this.server.emit(ChatEvent.ERROR, ErrorMessage.ROOM_NOT_FOUND);
      }

      await client.join(email);
      this.server.to(email).emit(ChatEvent.JOINED, room.email);

      this.logger.log(`Client ${client.id} joined room ${email}`);
    } catch (error) {
      this.server.emit(ChatEvent.ERROR, ErrorMessage.COULD_NOT_JOIN_ROOM);
      this.logger.error(`${ErrorMessage.COULD_NOT_JOIN_ROOM}: ${error.message}`);
    }
  }

  @SubscribeMessage(ChatEvent.SEND)
  async onSendMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: CreateMessagePayload) {
    try {
      const isClientInAdminRoom = await this.isClientInAdminRoom(client.id);

      const role = isClientInAdminRoom ? Role.ADMIN : Role.USER;

      if (role === Role.ADMIN && !isClientInAdminRoom) {
        this.logger.error(`${ErrorMessage.COULD_NOT_SEND_MESSAGE}`);
        return;
      }

      const createdMessage = await this.contactService.createMessage({ ...payload, from: role });

      this.broadcastMessage(payload.email, createdMessage, role);

      if (role === Role.ADMIN) {
        this.server
          .to(CHAT_ADMIN_ROOM_ID)
          .emit(ChatEvent.ADMIN_MESSAGE, { roomEmail: payload.email, message: createdMessage });

        const hasOpponent = await this.hasOpponent(client.id, payload.email);

        if (!hasOpponent) {
          this.mailerService.sendMail({
            to: payload.email,
            subject: MailSubject.NEW_MESSAGE,
            template: "new-message",
            context: {
              user: payload.email,
              message: createdMessage.message,
              time: createdMessage.createAt,
            },
          });
        }
      }
    } catch (error) {
      this.logger.error(`${ErrorMessage.COULD_NOT_SEND_MESSAGE}: ${error.message}`);
      this.server.emit(ChatEvent.ERROR, ErrorMessage.COULD_NOT_SEND_MESSAGE);
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

  private async hasOpponent(clientId: string, roomId: string): Promise<boolean> {
    const clientsInAdminRoom = await this.server.in(roomId).fetchSockets();
    return clientsInAdminRoom.some((socket) => socket.id != clientId);
  }

  private broadcastMessage(roomEmail: string, message: ChatMessage, role: Role) {
    if (role != Role.ADMIN) {
      this.server.to(CHAT_ADMIN_ROOM_ID).emit(ChatEvent.ADMIN_MESSAGE, { roomEmail, message });
    }

    this.server.to(roomEmail).emit(ChatEvent.MESSAGE, message);
  }
}
