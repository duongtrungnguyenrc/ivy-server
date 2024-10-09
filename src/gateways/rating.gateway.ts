import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";

import { Auth, SocketAuthUid } from "@app/decorators";
import { CreateRatingPayload } from "@app/models";
import { JWTSocketAuthGuard } from "@app/guards";
import { RatingService } from "@app/services";
import { RatingEvent } from "@app/enums";

@WebSocketGateway({ namespace: "rating" })
export class RatingGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server: Server;
  private readonly logger: Logger = new Logger(RatingGateway.name);

  constructor(private readonly ratingService: RatingService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage(RatingEvent.LISTEN)
  async onRegisterForProduct(@ConnectedSocket() client: Socket, @MessageBody() productId: string) {
    client.join(productId);
    this.logger.log(`Client ${client.id} joined room: ${productId}`);
  }

  @SubscribeMessage(RatingEvent.LEAVE)
  async onLeaveForProduct(@ConnectedSocket() client: Socket, @MessageBody() productId: string) {
    client.leave(productId);
    this.logger.log(`Client ${client.id} left room: ${productId}`);
  }

  @SubscribeMessage(RatingEvent.TYPING)
  async onTyping(@ConnectedSocket() client: Socket, @MessageBody() productId: string) {
    client.to(productId).emit(RatingEvent.TYPING, { userId: client.id });
  }

  @SubscribeMessage(RatingEvent.STOP_TYPING)
  async onStopTyping(@ConnectedSocket() client: Socket, @MessageBody() productId: string) {
    client.to(productId).emit(RatingEvent.STOP_TYPING, { userId: client.id });
  }

  @SubscribeMessage(RatingEvent.COMMENT)
  @Auth(["*"], JWTSocketAuthGuard)
  async onComment(@SocketAuthUid() userId: string, @MessageBody() payload: CreateRatingPayload) {
    const newRating = await this.ratingService.addComment(userId, payload);

    this.server.to(payload.productId).emit(RatingEvent.COMMENT, newRating);
  }
}
