import { BadRequestException, Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { CreateMessagePayload, InfiniteResponse, SendEmailPayload } from "@app/models";
import { ChatMessage, ChatRoom } from "@app/schemas";
import { withMutateTransaction } from "@app/utils";
import { ErrorMessage } from "@app/enums";

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(ChatRoom.name)
    private readonly chatRoomModel: Model<ChatRoom>,
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessage>,
    private readonly mailerService: MailerService,
  ) {}

  async sendEmail(payload: SendEmailPayload): Promise<void> {
    const { to, subject, content } = payload;

    await this.mailerService.sendMail({
      to: to,
      subject: subject,
      html: content,
    });
  }

  async getOrCreateRoom(email: string): Promise<ChatRoom> {
    const room: ChatRoom = await this.chatRoomModel
      .findOne({
        email,
      })
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 }, limit: 10 },
      })
      .lean();

    if (!room) return await this.chatRoomModel.create({ email });

    return room;
  }

  async loadRoom(email: string): Promise<ChatRoom> {
    const room: ChatRoom = await this.chatRoomModel
      .findOne({ email })
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 }, limit: 10 },
      })
      .lean();

    if (!room) throw new BadRequestException(ErrorMessage.ROOM_NOT_FOUND);

    return room;
  }

  async getChatRooms(pagination: Pagination): Promise<InfiniteResponse<ChatRoom>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const rooms: ChatRoom[] = await this.chatRoomModel
      .find({ messages: { $ne: [] } })
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 }, limit: 1 },
      })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalRooms: number = await this.chatRoomModel.countDocuments();
    const pages: number = totalRooms / limit;

    const nextCursor: number = page < pages ? page + 1 : undefined;

    return {
      nextCursor,
      data: rooms,
    };
  }

  async createMessage(payload: CreateMessagePayload): Promise<ChatMessage> {
    return withMutateTransaction<ChatMessage>(this.chatMessageModel, async (session) => {
      const { email, ...message } = payload;

      const [createdMessage]: ChatMessage[] = await this.chatMessageModel.create(
        [
          {
            ...message,
            email,
          },
        ],
        { session },
      );

      this.chatRoomModel
        .updateOne(
          { email },
          {
            $push: {
              messages: createdMessage._id,
            },
          },
        )
        .catch((error) => {
          console.error("Failed to add message to contact room:", error);
        });

      return createdMessage;
    });
  }

  async getRoomMessages(email: string, pagination: Pagination): Promise<InfiniteResponse<ChatMessage>> {
    const { page, limit } = pagination;
    const room: ChatRoom = await this.chatRoomModel.findOne({ email }).lean();

    if (!room) throw new BadRequestException(ErrorMessage.ROOM_NOT_FOUND);

    const skip = room.messages.length - page * limit;

    const messages: ChatMessage[] = await this.chatMessageModel
      .find({ _id: { $in: room.messages } })
      .sort({ createdAt: 1 })
      .skip(skip >= 0 ? skip : 0)
      .limit(limit)
      .lean();

    const totalRooms: number = await this.chatMessageModel.countDocuments({ _id: { $in: room.messages } });
    const pages: number = Math.floor(totalRooms / limit);

    const nextCursor: number = page < pages ? page + 1 : undefined;

    const response: InfiniteResponse<ChatMessage> = {
      nextCursor,
      data: messages,
    };

    return response;
  }
}
