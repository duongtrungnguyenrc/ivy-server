import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery, Types } from "mongoose";
import { Cache } from "@nestjs/cache-manager";
import { genSalt, hash } from "bcrypt";

import { GetAccessHistoryResponse, UpdateUserPayload } from "@app/models";
import { joinCacheKey, withMutateTransaction } from "@app/utils";
import { USER_CACHE_PREFIX } from "@app/constants";
import { AccessRecord, User } from "@app/schemas";
import { ErrorMessage } from "@app/enums";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(AccessRecord.name)
    private readonly accessRecordModel: Model<AccessRecord>,
    private readonly cacheManager: Cache,
  ) {}

  async getAuthUser(id: string): Promise<User> {
    const user = await this.findOneUser({ _id: id });

    if (!user) throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED);

    return user;
  }

  async updateUser(payload: UpdateUserPayload, userId: string): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(userId, payload, { new: true });

    if (!updatedUser) throw new BadRequestException(ErrorMessage.USER_NOT_FOUND);

    await this.clearUserCache(updatedUser._id);
    return updatedUser;
  }

  async createAccessRecord(userId: string, requestAgent: [string, string], ipAddress: string): Promise<AccessRecord> {
    const [deviceInfo, browserInfo] = requestAgent;

    const session = await this.accessRecordModel.db.startSession();

    return withMutateTransaction(session, async () => {
      const record = new this.accessRecordModel({
        user: new Types.ObjectId(userId),
        deviceInfo,
        browserInfo,
        ipAddress,
      });

      return record.save({ session });
    });
  }

  async getAccessHistory(userId: string, { page, limit }: Pagination): Promise<GetAccessHistoryResponse> {
    const recordsQuantity = await this.accessRecordModel.countDocuments({ user: new Types.ObjectId(userId) }).lean();

    const totalPages = Math.ceil(recordsQuantity / limit);

    const records: AccessRecord[] = await this.accessRecordModel
      .find({ user: new Types.ObjectId(userId) })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const responseData: GetAccessHistoryResponse = {
      accessRecords: records.map((record) => {
        const parsedCreatedTime = new Date(record.createdAt);

        const time = `${parsedCreatedTime.toLocaleTimeString("vi-vn")} ${parsedCreatedTime.toLocaleDateString("vi-vn")}`;

        return {
          ...record,
          createdAt: time,
        };
      }),
      page: page,
      limit: limit,
      totalPages: totalPages,
    };

    return responseData;
  }

  async findOneUser(
    query: FilterQuery<User>,
    includes: (keyof User)[] = [],
    populate: (keyof User)[] = [],
    force = false,
  ): Promise<User> {
    if (!force && query._id) {
      const cachedUser = await this.getUserFromCache(query._id);
      if (cachedUser) return cachedUser;
    }

    const includeQueries = includes.map((key) => {
      return `+${key}`;
    });

    const user = await this.userModel.findOne(query, includeQueries).populate(populate).lean();
    if (user) await this.cacheUser(user._id, user);

    return user;
  }

  async createUser(payload: Partial<User>): Promise<User> {
    const { password, ...userInfo } = payload;
    const hashedPassword = await this.hashPassword(password);

    const createdUser = new this.userModel({
      ...userInfo,
      password: hashedPassword,
    });

    return createdUser.save();
  }

  async findAndUpdateUser(payload: FilterQuery<User>, updates: Partial<User>): Promise<User> {
    return await this.userModel.findOneAndUpdate(payload, updates, { new: true });
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    return hash(password, salt);
  }

  private async getUserFromCache(userId: string): Promise<User | null> {
    return this.cacheManager.get<User>(joinCacheKey(USER_CACHE_PREFIX, userId));
  }

  private async cacheUser(userId: string, user: User): Promise<void> {
    await this.cacheManager.set(joinCacheKey(USER_CACHE_PREFIX, userId), user);
  }

  private async clearUserCache(userId: string): Promise<void> {
    await this.cacheManager.del(joinCacheKey(USER_CACHE_PREFIX, userId));
  }
}
