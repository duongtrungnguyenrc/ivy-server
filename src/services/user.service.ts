import { Injectable } from "@nestjs/common";
import { genSalt, hash } from "bcrypt";
import { Model } from "mongoose";

import { User } from "@app/schemas";
import { Cache } from "@nestjs/cache-manager";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly cacheManager: Cache,
  ) {}

  async getUserByEmail(
    email: string,
    includes: (keyof User)[] = [],
  ): Promise<User> {
    const includeQueries = includes.map((key) => {
      return `+${key}`;
    });

    const user: User = await this.userModel.findOne(
      { email: email },
      includeQueries,
    );

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
}
