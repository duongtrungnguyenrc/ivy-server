import { BadRequestException, Injectable } from "@nestjs/common";
import { ClientSession, Model, Types } from "mongoose";
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

  async loadChatRoom(customerId: string): Promise<ChatRoom> {
    const objectUid: Types.ObjectId = new Types.ObjectId(customerId);

    if (!objectUid) return await this.chatRoomModel.create({});

    const room: ChatRoom = await this.chatRoomModel.findOne({ customer: objectUid });

    if (!room) return await this.chatRoomModel.create({ customer: objectUid });

    return room;
  }

  async createChatRoom(customerId?: string): Promise<ChatRoom> {
    const existingRoom: ChatRoom | null = await this.chatRoomModel.findOne({
      customer: new Types.ObjectId(customerId),
    });

    if (existingRoom) throw new BadRequestException(ErrorMessage.ROOM_EXISTED);

    const createdChatRoom: ChatRoom = await this.chatRoomModel.create({ customer: new Types.ObjectId(customerId) });
    return createdChatRoom;
  }

  async loadRoom(roomId: string): Promise<ChatRoom> {
    const room: ChatRoom = await this.chatRoomModel
      .findById(roomId)
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
      .find()
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 }, limit: 10 },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit)
      .lean();

    return rooms;
  }

  async createMessage(senderId: string, payload: CreateMessagePayload): Promise<ChatMessage> {
    const session: ClientSession = await this.chatMessageModel.db.startSession();

    return withMutateTransaction(session, async () => {
      const createdMessage: ChatMessage = await this.chatMessageModel.create({
        message: payload.message,
        sender: new Types.ObjectId(senderId),
      });

      await this.chatRoomModel.findByIdAndUpdate(payload.roomId, {
        $push: {
          messages: createdMessage._id,
        },
      });

      return createdMessage;
    });
  }

  async getRoomMessages(roomId: string, pagination: Pagination): Promise<ChatMessage[]> {
    const skip = (pagination.page - 1) * pagination.limit;

    const messages: ChatMessage[] = await this.chatMessageModel
      .find({ _id: roomId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit)
      .lean();

    return messages;
  }
}
