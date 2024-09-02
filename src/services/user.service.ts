import { InjectModel } from "@nestjs/mongoose";
import { Cache } from "@nestjs/cache-manager";
import { Injectable } from "@nestjs/common";
import { genSalt, hash } from "bcrypt";
import { decode } from "jsonwebtoken";
import { Request } from "express";
import { Model } from "mongoose";

import { getTokenFromRequest } from "@app/utils";
import { User } from "@app/schemas";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly cacheManager: Cache,
  ) {}

  async findUserByEmail(email: string, includes: (keyof User)[] = []): Promise<User> {
    const includeQueries = includes.map((key) => {
      return `+${key}`;
    });

    const user: User = await this.userModel.findOne({ email: email }, includeQueries);

    return user;
  }

  async findOneUser(query: Partial<User>, includes: (keyof User)[] = []): Promise<User> {
    const includeQueries = includes.map((key) => {
      return `+${key}`;
    });

    const user: User = await this.userModel.findOne({ ...query }, includeQueries);

    return user;
  }

  async findUsers(query: Partial<User>, includes: (keyof User)[] = []): Promise<User[]> {
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

  async updateUser(payload: Partial<User>, updates: Partial<User>): Promise<User> {
    return this.userModel.findOneAndUpdate(payload, updates, { new: true });
  }

  extractUserIdFromAuth(request: Request): string {
    const accessToken = getTokenFromRequest(request);

    const payload = decode(accessToken);

    return payload?.["userId"];
  }
}
