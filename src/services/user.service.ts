import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { FilterQuery, Model, PopulateOptions, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { genSalt, hash } from "bcrypt";

import { PaginationResponse, UpdateUserPayload } from "@app/models";
import { joinCacheKey, withMutateTransaction } from "@app/utils";
import { USER_CACHE_PREFIX } from "@app/constants";
import { AccessRecord, User } from "@app/schemas";
import { CacheService } from "./cache.service";
import { ErrorMessage } from "@app/enums";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(AccessRecord.name)
    private readonly accessRecordModel: Model<AccessRecord>,
    private readonly cacheService: CacheService,
  ) {}

  async getAuthUser(id: string): Promise<User> {
    const user = await this.findUser(id);

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

  async getAccessHistory(userId: string, { page, limit }: Pagination): Promise<PaginationResponse<AccessRecord>> {
    const recordsQuantity = await this.accessRecordModel.countDocuments({ user: new Types.ObjectId(userId) }).lean();

    const totalPages = Math.ceil(recordsQuantity / limit);

    const records: AccessRecord[] = await this.accessRecordModel
      .find({ user: new Types.ObjectId(userId) })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return {
      data: records.map((record) => {
        const parsedCreatedTime = new Date(record.createdAt);

        const time = `${parsedCreatedTime.toLocaleTimeString("vi-vn")} ${parsedCreatedTime.toLocaleDateString("vi-vn")}`;

        return {
          ...record,
          createdAt: time,
        };
      }),
      meta: {
        page: page,
        limit: limit,
        pages: totalPages,
      },
    };
  }

  async findUser(
    idOrFilter: string | FilterQuery<User>,
    select?: string | string[] | Record<string, number | boolean | string | object>,
    populate?: PopulateOptions | Array<PopulateOptions | string>,
    force: boolean = false,
    cacheKey: string = "",
  ): Promise<User> {
    const boundCacheKey: string = `${USER_CACHE_PREFIX}:${JSON.stringify(idOrFilter)}:${JSON.stringify(select)}${cacheKey}`;

    const cachedUser = force ? null : await this.cacheService.get<User>(boundCacheKey);

    if (cachedUser) return cachedUser;

    const query =
      typeof idOrFilter === "string" ? this.userModel.findById(idOrFilter) : this.userModel.findOne(idOrFilter);

    if (select) {
      query.select(select);
    }

    if (populate) {
      query.populate(populate);
    }

    const user = await query.exec();

    await this.cacheService.set(boundCacheKey, user);

    return user;
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
    return this.userModel.findOneAndUpdate(payload, updates, { new: true });
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    return hash(password, salt);
  }

  private async getUserFromCache(userId: string): Promise<User | null> {
    return this.cacheService.get<User>(joinCacheKey(USER_CACHE_PREFIX, userId));
  }

  private async cacheUser(userId: string, user: User): Promise<void> {
    await this.cacheService.set(joinCacheKey(USER_CACHE_PREFIX, userId), user);
  }

  private async clearUserCache(userId: string): Promise<void> {
    await this.cacheService.del(joinCacheKey(USER_CACHE_PREFIX, userId));
  }
}
