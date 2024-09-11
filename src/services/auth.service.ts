import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { compare, genSalt, hash } from "bcrypt";
import { Cache } from "@nestjs/cache-manager";
import { Request } from "express";

import { ACCESS_PAIR_CACHE_PREFIX, OTP_LENGTH, OTP_TTL, RESET_PASSOWRD_TRANSACTION_CACHE_PREFIX } from "@app/constants";
import { SignInPayload, SignUpPayload, ForgotPasswordPayload, ResetPasswordPayload } from "@app/models";
import { getTokenFromRequest, joinCacheKey } from "@app/utils";
import { JwtAccessService, JwtRefreshService } from ".";
import { UserService } from "./user.service";
import { User } from "@app/schemas";
import { ErrorMessage } from "@app/enums";

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

    const user: User = await this.userService.findUserByEmail(email, ["password"]);

    if (!user) throw new BadRequestException("User not found!");

    const isMatch: boolean = await compare(password, user.password);

    if (!isMatch) throw new BadRequestException("Invalid password!");

    return isMatch;
  }

  async signIn(payload: SignInPayload): Promise<TokenPair> {
    const { email } = payload;

    const user: User = await this.userService.findUserByEmail(email, ["password"]);

    const cachedTokenPair: TokenPair = await this.getCachedTokenPair(user._id);

    if (cachedTokenPair) {
      return cachedTokenPair;
    }

    const tokenPayload: JwtPayload = {
      userId: user._id,
      role: user.role,
    };

    const tokenPair: TokenPair = this.generateTokenPair(tokenPayload);

    this.cacheTokenPair(user._id, tokenPair);

    return tokenPair;
  }

  async signUp(payload: SignUpPayload): Promise<void> {
    const createdUser: User = await this.userService.createUser(payload);

    delete createdUser.password;

    this.mailService.sendMail({
      to: createdUser.email,
      subject: "Welcome to Ivy",
      template: "register",
      context: { user: createdUser.name },
    });
  }

  async signOut(request: Request): Promise<void> {
    const userId: string = this.userService.extractUserIdFromAuth(request);

    if (!userId) {
      throw new UnauthorizedException(ErrorMessage.INVALID_AUTH_TOKEN);
    }

    this.revokeTokenPair(userId);
  }

  async refreshToken(request: Request): Promise<TokenPair> {
    const refreshToken: string = getTokenFromRequest(request);

    const { exp: _, iat: __, ...tokenPayload }: JwtPayload = this.jwtRefreshService.decodeToken(refreshToken);

    this.revokeTokenPair(tokenPayload.userId);

    const newTokenPair: TokenPair = this.generateTokenPair(tokenPayload);

    this.cacheTokenPair(tokenPayload.userId, newTokenPair);

    return newTokenPair;
  }

  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    const { _id, email, name }: User = await this.userService.findOneUser({
      email: payload.email,
    });

    if (!_id) {
      throw new BadRequestException(ErrorMessage.USER_NOT_FOUND);
    }

    const otpCode: string = await this.generateOTP(_id);

    this.mailService.sendMail({
      to: email,
      subject: "Account Recovery OTP for Ivy",
      template: "forgot-password",
      context: { user: name, otp: otpCode },
    });
  }

  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    const { newPassword, userId, otpCode } = payload;

    const cachedTransaction: ResetPasswordTransactionPayload = await this.getCachedOtp(userId);

    if (otpCode != cachedTransaction.otpCode) {
      throw new BadRequestException("Mã OTP không hợp lệ");
    }

    const salf = await genSalt(10);
    const password: string = await hash(newPassword, salf);

    const updatedUser: User = await this.userService.updateUser({ _id: userId }, { password });

    if (!updatedUser) {
      throw new BadRequestException("Invalid user");
    }
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
    const decodedAccessToken = this.jwtAccessService.decodeToken(tokenPair.accessToken);

    const currentTime = Math.floor(Date.now() / 1000);
    const tokenValidTime = (decodedAccessToken["exp"] - currentTime) * 1000;

    this.cacheManager.set(joinCacheKey(ACCESS_PAIR_CACHE_PREFIX, userId), tokenPair, tokenValidTime);
  }

  private async getCachedTokenPair(userId: string): Promise<TokenPair> {
    return await this.cacheManager.get<TokenPair>(joinCacheKey(ACCESS_PAIR_CACHE_PREFIX, userId));
  }

  async revokeTokenPair(userId: string): Promise<void> {
    const cachedTokenPair: TokenPair = await this.getCachedTokenPair(userId);

    if (!cachedTokenPair) return;

    await Promise.all([
      this.jwtAccessService.revokeToken(cachedTokenPair.accessToken),
      this.jwtRefreshService.revokeToken(cachedTokenPair.refreshToken),
    ]);
  }
}
