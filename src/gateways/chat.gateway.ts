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
  private readonly connectedClients = new Map<string, string>();

  constructor(
    private readonly contactService: ContactService,
    private readonly mailerService: MailerService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client ${client.id} connected`);
  }

  handleDisconnect(client: Socket) {
    const roomId = this.connectedClients.get(client.id);
    if (roomId) {
      client.leave(roomId);
      this.connectedClients.delete(client.id);
    }
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage(ChatEvent.JOIN_ADMIN)
  @Auth(["ADMIN", "OWNER"], JWTSocketAuthGuard)
  async onJoinAdminRoom(@ConnectedSocket() client: Socket) {
    try {
      await client.join(CHAT_ADMIN_ROOM_ID);
      this.connectedClients.set(client.id, CHAT_ADMIN_ROOM_ID);
      client.emit(ChatEvent.JOINED_ADMIN);
      this.logger.log(`Client ${client.id} joined admin room`);
    } catch (error) {
      this.logger.error(`Failed to join admin room: ${error.message}`);
      client.emit(ChatEvent.ERROR, ErrorMessage.COULD_NOT_JOIN_ROOM);
    }
  }

  @SubscribeMessage(ChatEvent.JOIN)
  async onJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() email: string) {
    try {
      const room = await this.contactService.loadRoom(email);

      if (!room) {
        client.emit(ChatEvent.ERROR, ErrorMessage.ROOM_NOT_FOUND);
        return;
      }

      const previousRoom = this.connectedClients.get(client.id);
      if (previousRoom) {
        await client.leave(previousRoom);
      }

      await client.join(email);
      this.connectedClients.set(client.id, email);

      client.emit(ChatEvent.JOINED, room.email);

      this.logger.log(`Client ${client.id} joined room ${email}`);
    } catch (error) {
      this.logger.error(`${ErrorMessage.COULD_NOT_JOIN_ROOM}: ${error.message}`);
      client.emit(ChatEvent.ERROR, ErrorMessage.COULD_NOT_JOIN_ROOM);
    }
  }

  @SubscribeMessage(ChatEvent.SEND)
  async onSendMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: CreateMessagePayload) {
    try {
      const isClientInAdminRoom = await this.isClientInAdminRoom(client.id);
      const role = isClientInAdminRoom ? Role.ADMIN : Role.CUSTOMER;

      if (role === Role.CUSTOMER) {
        const currentRoom = this.connectedClients.get(client.id);
        if (!currentRoom || currentRoom !== payload.email) {
          this.logger.error(`Customer ${client.id} not in correct room`);
          client.emit(ChatEvent.ERROR, ErrorMessage.COULD_NOT_SEND_MESSAGE);
          return;
        }
      }

      if (role === Role.ADMIN && !isClientInAdminRoom) {
        this.logger.error(`Admin ${client.id} not in admin room`);
        client.emit(ChatEvent.ERROR, ErrorMessage.COULD_NOT_SEND_MESSAGE);
        return;
      }

      const room = await this.contactService.loadRoom(payload.email);

      console.log(room.messages.length);

      if (room.messages.length <= 0) {
        await this.server.to(CHAT_ADMIN_ROOM_ID).emit(ChatEvent.NEW_ROOM, room);
      }

      const createdMessage = await this.contactService.createMessage({ ...payload, from: role });

      await this.broadcastMessage(payload.email, createdMessage);

      if (role === Role.ADMIN) {
        const hasOpponent = await this.hasOpponent(client.id, payload.email);

        if (!hasOpponent) {
          await this.mailerService.sendMail({
            to: payload.email,
            subject: MailSubject.NEW_MESSAGE,
            template: "new-message",
            context: {
              user: payload.email,
              message: createdMessage.message,
              time: createdMessage.createdAt,
            },
          });
        }
      }
    } catch (error) {
      this.logger.error(`${ErrorMessage.COULD_NOT_SEND_MESSAGE}: ${error.message}`);
      client.emit(ChatEvent.ERROR, ErrorMessage.COULD_NOT_SEND_MESSAGE);
    }
  }

  @SubscribeMessage(ChatEvent.TYPING)
  async onTyping(@ConnectedSocket() client: Socket, @MessageBody() payload: ChatTypingPayload) {
    try {
      const isClientInAdminRoom = await this.isClientInAdminRoom(client.id);

      if (!isClientInAdminRoom) {
        const currentRoom = this.connectedClients.get(client.id);
        if (!currentRoom || currentRoom !== payload.room) {
          this.logger.error(`Client ${client.id} not in correct room for typing event`);
          return;
        }
      }

      await this.server.to(CHAT_ADMIN_ROOM_ID).emit(ChatEvent.TYPING, payload.email);
      await this.server.to(payload.room).emit(ChatEvent.TYPING, payload.email);
      this.logger.log(`Typing event emitted for ${payload.email} in room ${payload.room}`);
    } catch (error) {
      this.logger.error(`Error handling typing event: ${error.message}`);
    }
  }

  @SubscribeMessage(ChatEvent.STOP_TYPING)
  async onStopTyping(@ConnectedSocket() client: Socket, @MessageBody() payload: ChatTypingPayload) {
    try {
      const isClientInAdminRoom = await this.isClientInAdminRoom(client.id);

      if (!isClientInAdminRoom) {
        const currentRoom = this.connectedClients.get(client.id);
        if (!currentRoom || currentRoom !== payload.room) {
          this.logger.error(`Client ${client.id} not in correct room for stop typing event`);
          return;
        }
      }

      await this.server.to(CHAT_ADMIN_ROOM_ID).emit(ChatEvent.STOP_TYPING, payload.email);
      await this.server.to(payload.room).emit(ChatEvent.STOP_TYPING, payload.email);
      this.logger.log(`Stop typing event emitted for ${payload.email} in room ${payload.room}`);
    } catch (error) {
      this.logger.error(`Error handling stop typing event: ${error.message}`);
    }
  }

  private async broadcastMessage(roomEmail: string, message: ChatMessage) {
    try {
      await this.server.to(roomEmail).emit(ChatEvent.MESSAGE, message);

      await this.server.to(CHAT_ADMIN_ROOM_ID).emit(ChatEvent.ADMIN_MESSAGE, {
        roomEmail,
        message,
      });
    } catch (error) {
      this.logger.error(`Failed to broadcast message: ${error.message}`);
      throw error;
    }
  }

  private async isClientInAdminRoom(clientId: string): Promise<boolean> {
    const currentRoom = this.connectedClients.get(clientId);
    if (currentRoom === CHAT_ADMIN_ROOM_ID) return true;

    const clientsInAdminRoom = await this.server.in(CHAT_ADMIN_ROOM_ID).fetchSockets();
    return clientsInAdminRoom.some((socket) => socket.id === clientId);
  }

  private async hasOpponent(clientId: string, roomId: string): Promise<boolean> {
    const clientsInRoom = await this.server.in(roomId).fetchSockets();
    return clientsInRoom.some((socket) => socket.id !== clientId);
  }
}
