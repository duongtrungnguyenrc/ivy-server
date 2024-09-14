import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import { Cache } from "@nestjs/cache-manager";
import { genSalt, hash } from "bcrypt";
import { decode } from "jsonwebtoken";
import { Request } from "express";

import { getTokenFromRequest, joinCacheKey } from "@app/utils";
import { USER_CACHE_PREFIX } from "@app/constants";
import { User } from "@app/schemas";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly cacheManager: Cache,
  ) {}

  async getUser(id: string): Promise<User> {
    return await this.findOneUser({ _id: id });
  }

  async findUserFromAuth(request: Request, raw: boolean = false): Promise<User> {
    const userId = this.extractUserIdFromAuth(request);

    const user: User = await this.findOneUser({ _id: userId });

    if (!userId && !raw) throw new UnauthorizedException("User not found");

    return user;
  }

  async findOneUser(
    query: FilterQuery<User>,
    includes: (keyof User)[] = [],
    populate: (keyof User)[] = [],
    force: boolean = false,
  ): Promise<User> {
    if (!force && query._id) {
      const userCacheKey: string = joinCacheKey(USER_CACHE_PREFIX, query._id);

      const cachedUser: User = await this.cacheManager.get(userCacheKey);

      if (cachedUser) return cachedUser;
    }

    const includeQueries = includes.map((key) => {
      return `+${key}`;
    });

    const user: User = await this.userModel.findOne({ ...query }, includeQueries).populate(populate);

    if (!user) return;

    const userCacheKey: string = joinCacheKey(USER_CACHE_PREFIX, user._id);

    this.cacheManager.set(userCacheKey, user);

    return user;
  }

  async findUsers(query: FilterQuery<User>, includes: (keyof User)[] = []): Promise<User[]> {
    const includeQueries = includes.map((key) => {
      return `+${key}`;
    });

    const user: User[] = await this.userModel.find({ ...query }, includeQueries);

    return user;
  }

  async createUser(payload: Partial<User>): Promise<User> {
    const { password, ...userInfo } = payload;

    const salf = await genSalt();
    const hashedPassword: string = await hash(password, salf);

    const createdUser: User = await this.userModel.create({
      ...userInfo,
      password: hashedPassword,
    });

    return createdUser;
  }

  async updateUser(payload: FilterQuery<User>, updates: Partial<User>): Promise<User> {
    return this.userModel.findOneAndUpdate(payload, updates, { new: true });
  }

  extractUserIdFromAuth(request: Request): string {
    const accessToken = getTokenFromRequest(request);

    const payload = decode(accessToken);

    return payload?.["userId"];
  }
}
