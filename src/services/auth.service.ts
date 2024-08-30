import { Injectable, UnauthorizedException } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { Cache } from "@nestjs/cache-manager";
import { compare } from "bcrypt";

import {
  ACCESS_PAIR_CACHE_PREFIX,
  OTP_LENGTH,
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  SignUpResponse,
} from "@app/data";
import { JwtAccessService, JwtRefreshService } from ".";
import { UserService } from "./user.service";
import { joinCacheKey } from "@app/utils";
import { User } from "@app/schemas";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtAccessService: JwtAccessService,
    private readonly jwtRefreshService: JwtRefreshService,
    private readonly cacheManager: Cache,
    private readonly mailService: MailerService,
  ) {}

  async validateUser(payload: SignInPayload): Promise<boolean> {
    const { email, password } = payload;

    const user: User = await this.userService.getUserByEmail(email, [
      "password",
    ]);

    if (!user) throw new UnauthorizedException("User not found!");

    const isMatch: boolean = await compare(password, user.password);

    return isMatch;
  }

  async signIn(payload: SignInPayload): Promise<SignInResponse> {
    const { email } = payload;

    const user: User = await this.userService.getUserByEmail(email, [
      "password",
    ]);

    const cachedTokenPair: TokenPair = await this.getCachedTokenPair(user._id);

    let responseData: TokenPair = cachedTokenPair;

    if (!responseData) {
      const tokenPayload: JwtPayload = {
        userId: user._id,
      };

      const tokenPair: TokenPair = this.generateTokenPair(tokenPayload);

      this.cacheTokenPair(user._id, tokenPair);

      responseData = tokenPair;
    }

    const response: SignInResponse = {
      data: responseData,
      message: "Sign in success",
    };

    return response;
  }

  async signUp(payload: SignUpPayload): Promise<SignUpResponse> {
    const createdUser: User = await this.userService.createUser(payload);

    delete createdUser.password;

    this.mailService.sendMail({
      to: createdUser.email,
      subject: "Welcome to Ivy",
      template: "register",
      context: { user: createdUser.name },
    });

    const response: SignUpResponse = {
      data: true,
      message: "Create user success!",
    };

    return response;
  }

  private generateOTP() {
    return Array.from({ length: OTP_LENGTH }, () =>
      Math.floor(Math.random() * 10),
    ).join("");
  }

  private generateTokenPair(payload: any): TokenPair {
    return {
      accessToken: this.jwtAccessService.generateToken(payload),
      refreshToken: this.jwtRefreshService.generateToken(payload),
    };
  }

  private cacheTokenPair(userId: string, tokenPair: TokenPair): void {
    const decodedAccessToken: any = this.jwtAccessService.decodeToken<any>(
      tokenPair.accessToken,
    );

    const currentTime = Math.floor(Date.now() / 1000);
    const tokenValidTime = (decodedAccessToken.exp - currentTime) * 1000;

    this.cacheManager.set(
      joinCacheKey(ACCESS_PAIR_CACHE_PREFIX, userId),
      tokenPair,
      tokenValidTime,
    );
  }

  private async getCachedTokenPair(userId: string): Promise<TokenPair> {
    return await this.cacheManager.get<TokenPair>(
      joinCacheKey(ACCESS_PAIR_CACHE_PREFIX, userId),
    );
  }

  async revokeTokenPair(userId: string): Promise<void> {
    await this.cacheManager.del(joinCacheKey(ACCESS_PAIR_CACHE_PREFIX, userId));

    const tokenPair: TokenPair = await this.getCachedTokenPair(userId);

    await Promise.all([
      this.jwtAccessService.revokeToken(tokenPair.accessToken),
      this.jwtRefreshService.revokeToken(tokenPair.refreshToken),
    ]);
  }
}
