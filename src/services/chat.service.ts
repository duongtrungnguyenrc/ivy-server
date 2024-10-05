import { BadRequestException, Injectable } from "@nestjs/common";
import { ClientSession, Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { ChatMessage, ChatRoom } from "@app/schemas";
import { CreateMessagePayload } from "@app/models";
import { withMutateTransaction } from "@app/utils";
import { ErrorMessage } from "@app/enums";

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(ChatRoom.name)
    private readonly chatRoomModel: Model<ChatRoom>,
    @InjectModel(ChatMessage.name)
    private readonly chatMessageModel: Model<ChatMessage>,
  ) {}

  async loadChatRoom(email: string): Promise<ChatRoom> {
    const room: ChatRoom = await this.chatRoomModel.findOne({
      email,
    });

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

  async getChatRooms(pagination: Pagination): Promise<ChatRoom[]> {
    const skip = (pagination.page - 1) * pagination.limit;

    const rooms: ChatRoom[] = await this.chatRoomModel
      .find({ messages: { $ne: [] } })
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 }, limit: 1 },
      })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(pagination.limit)
      .lean();

    return rooms;
  }

  async createMessage(payload: CreateMessagePayload): Promise<ChatMessage> {
    const session: ClientSession = await this.chatMessageModel.db.startSession();

    return withMutateTransaction(session, async () => {
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
          console.error("Failed to add message to chat room:", error);
        });

      return createdMessage;
    });
  }

  async getRoomMessages(email: string, pagination: Pagination): Promise<ChatMessage[]> {
    const room: ChatRoom = await this.chatRoomModel.findOne({ email }).lean();

    if (!room) throw new BadRequestException(ErrorMessage.ROOM_NOT_FOUND);

    const skip = room.messages.length - pagination.page * pagination.limit;

    const messages: ChatMessage[] = await this.chatMessageModel
      .find({ _id: { $in: room.messages } })
      .sort({ createdAt: 1 })
      .skip(skip >= 0 ? skip : 0)
      .limit(pagination.limit)
      .lean();

    return messages;
  }
}
