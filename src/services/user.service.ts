import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { FilterQuery, Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { genSalt, hash } from "bcrypt";

import { RepositoryService } from "@app/services/repository.service";
import { PaginationResponse, UpdateUserPayload } from "@app/models";
import { CacheService } from "@app/services/cache.service";
import { withMutateTransaction } from "@app/utils";
import { AccessRecord, User } from "@app/schemas";
import { USER_CACHE_PREFIX } from "@app/constants";
import { ErrorMessage } from "@app/enums";

@Injectable()
export class UserService extends RepositoryService<User> {
  constructor(
    @InjectModel(AccessRecord.name)
    private readonly accessRecordModel: Model<AccessRecord>,
    @InjectModel(User.name)
    readonly userModel: Model<User>,
    readonly cacheService: CacheService,
  ) {
    super(userModel, cacheService, USER_CACHE_PREFIX);
  }

  async getAuthUser(id: string): Promise<User> {
    const user = await this.find(id, undefined, undefined, true);

    if (!user) throw new UnauthorizedException(ErrorMessage.UNAUTHORIZED);

    return user;
  }

  async updateUser(payload: UpdateUserPayload, userId: string): Promise<User> {
    const updatedUser = await this.update(userId, payload);

    if (!updatedUser) throw new BadRequestException(ErrorMessage.USER_NOT_FOUND);

    return updatedUser;
  }

  async createAccessRecord(userId: string, requestAgent: [string, string], ipAddress: string): Promise<AccessRecord> {
    return withMutateTransaction<AccessRecord>(this.accessRecordModel, async (session) => {
      const [deviceInfo, browserInfo] = requestAgent;

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
      .exec();

    return {
      data: records,
      meta: {
        page: page,
        limit: limit,
        pages: totalPages,
      },
    };
  }

  async createUser(payload: Partial<User>): Promise<User> {
    const { password, ...userInfo } = payload;
    const hashedPassword = await this.hashPassword(password);

    return this.create({
      ...userInfo,
      password: hashedPassword,
    });
  }

  async findAndUpdateUser(payload: FilterQuery<User>, updates: Partial<User>): Promise<User> {
    return this._model.findOneAndUpdate(payload, updates, { new: true });
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(10);
    return hash(password, salt);
  }
}
