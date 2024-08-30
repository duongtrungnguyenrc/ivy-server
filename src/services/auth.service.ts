import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { compare, genSalt, hash } from "bcrypt";
import { Cache } from "@nestjs/cache-manager";
import { Request } from "express";

import { getTokenFromRequest, joinCacheKey } from "@app/utils";
import { JwtAccessService, JwtRefreshService } from ".";
import { UserService } from "./user.service";
import { User } from "@app/schemas";
import {
  ACCESS_PAIR_CACHE_PREFIX,
  OTP_LENGTH,
  OTP_TTL,
  RESET_PASSOWRD_TRANSACTION_CACHE_PREFIX,
  SignInPayload,
  SignInResponse,
  SignOutResponse,
  SignUpPayload,
  SignUpResponse,
  RefreshTokenResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from "@app/data";

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

    const user: User = await this.userService.getUserByEmail(email, ["password"]);

    if (!user) throw new UnauthorizedException("User not found!");

    const isMatch: boolean = await compare(password, user.password);

    return isMatch;
  }

  async signIn(payload: SignInPayload): Promise<SignInResponse> {
    const { email } = payload;

    const user: User = await this.userService.getUserByEmail(email, ["password"]);

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

  async signOut(request: Request): Promise<SignOutResponse> {
    const userId: string = this.userService.getUserIdFromAuth(request);

    if (!userId) {
      throw new UnauthorizedException("Token invalid");
    }

    this.revokeTokenPair(userId);

    const response: SignOutResponse = {
      data: true,
      message: "Sign out success",
    };

    return response;
  }

  async refreshToken(request: Request): Promise<RefreshTokenResponse> {
    const refreshToken: string = getTokenFromRequest(request);

    const tokenPayload: JwtPayload = this.jwtRefreshService.decodeToken(refreshToken);

    this.revokeTokenPair(tokenPayload.userId);

    const newTokenPair: TokenPair = this.generateTokenPair(tokenPayload);

    this.cacheTokenPair(tokenPayload.userId, newTokenPair);

    const response: RefreshTokenResponse = {
      data: newTokenPair,
      message: "Refresh token success",
    };

    return response;
  }

  async forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    const { _id, email, name }: User = await this.userService.getOneUser(payload);

    if (!_id) {
      throw new BadRequestException("User not found");
    }

    const otpCode: string = await this.generateOTP(_id);

    this.mailService.sendMail({
      to: email,
      subject: "Account Recovery OTP for Ivy",
      template: "forgot-password",
      context: { user: name, otp: otpCode },
    });

    const response: ForgotPasswordResponse = {
      data: true,
      message: "Create forgot password transaction success",
    };

    return response;
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    const { newPassword, userId, otpCode } = payload;

    const cachedTransaction: ResetPasswordTransactionPayload = await this.getCachedOtp(userId);

    if (otpCode != cachedTransaction.otpCode) {
      throw new BadRequestException("Invalid OTP");
    }

    const salf = await genSalt(10);
    const password: string = await hash(newPassword, salf);

    const updatedUser: User = await this.userService.updateUser({ _id: userId }, { password });

    if (!updatedUser) {
      throw new BadRequestException("Invalid user");
    }

    const response: ResetPasswordResponse = {
      data: true,
      message: "Reset password success",
    };

    return response;
  }

  /* Helper functions */

  private async generateOTP(userId: string): Promise<string> {
    const otpCode: string = Array.from({ length: OTP_LENGTH }, () => Math.floor(Math.random() * 10)).join("");

    const cachePayload: ResetPasswordTransactionPayload = { userId, otpCode };

    await this.cacheManager.set(joinCacheKey(RESET_PASSOWRD_TRANSACTION_CACHE_PREFIX, userId), cachePayload, OTP_TTL);

    return otpCode;
  }

  private async getCachedOtp(userId: string): Promise<ResetPasswordTransactionPayload> {
    const transaction: ResetPasswordTransactionPayload = await this.cacheManager.get(
      joinCacheKey(RESET_PASSOWRD_TRANSACTION_CACHE_PREFIX, userId),
    );

    return transaction;
  }

  private generateTokenPair(payload: any): TokenPair {
    return {
      accessToken: this.jwtAccessService.generateToken(payload),
      refreshToken: this.jwtRefreshService.generateToken(payload),
    };
  }

  private cacheTokenPair(userId: string, tokenPair: TokenPair): void {
    const decodedAccessToken: any = this.jwtAccessService.decodeToken<any>(tokenPair.accessToken);

    const currentTime = Math.floor(Date.now() / 1000);
    const tokenValidTime = (decodedAccessToken.exp - currentTime) * 1000;

    this.cacheManager.set(joinCacheKey(ACCESS_PAIR_CACHE_PREFIX, userId), tokenPair, tokenValidTime);
  }

  private async getCachedTokenPair(userId: string): Promise<TokenPair> {
    return await this.cacheManager.get<TokenPair>(joinCacheKey(ACCESS_PAIR_CACHE_PREFIX, userId));
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
