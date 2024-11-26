import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";
import { v4 as uuid } from "uuid";
import { compare } from "bcrypt";

import { ACCESS_PAIR_CACHE_PREFIX, OTP_LENGTH, OTP_TTL, RESET_PASSOWRD_TRANSACTION_CACHE_PREFIX } from "@app/constants";
import { ForgotPasswordPayload, ResetPasswordPayload, SignInPayload, SignUpPayload } from "@app/models";
import { JwtAccessService, JwtRefreshService, UserService } from ".";
import { ErrorMessage, MailSubject } from "@app/enums";
import { CacheService } from "./cache.service";
import { joinCacheKey } from "@app/utils";
import { User } from "@app/schemas";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtAccessService: JwtAccessService,
    private readonly jwtRefreshService: JwtRefreshService,
    private readonly mailService: MailerService,
    private readonly cacheService: CacheService,
  ) {}

  async validateUser({ email, password }: SignInPayload): Promise<boolean> {
    const user = await this.userService.find({ email }, ["_id", "password", "role"], undefined, true);
    if (!user) throw new BadRequestException(ErrorMessage.WRONG_EMAIL_OR_PASSWORD);

    const isMatch = await compare(password, user.password);
    if (!isMatch) throw new BadRequestException(ErrorMessage.WRONG_EMAIL_OR_PASSWORD);
    return isMatch;
  }

  async signIn({ email }: SignInPayload, requestAgent: [string, string], ipAddress: string): Promise<TokenPair> {
    const user = await this.userService.find({ email }, ["_id", "password", "role"]);
    const cachedTokenPair = await this.getCachedTokenPair(user._id);

    if (cachedTokenPair) {
      this.userService.createAccessRecord(user._id, requestAgent, ipAddress);
      return cachedTokenPair;
    }

    const tokenPayload: JwtPayload = { userId: user._id, role: user.role };
    const tokenPair = this.generateTokenPair(tokenPayload);

    this.cacheTokenPair(user._id, tokenPair);
    this.userService.createAccessRecord(user._id, requestAgent, ipAddress);

    return tokenPair;
  }

  async signUp(payload: SignUpPayload): Promise<void> {
    const createdUser: User = await this.userService.createUser(payload);

    delete createdUser.password;

    this.mailService.sendMail({
      to: createdUser.email,
      subject: MailSubject.REGISTER,
      template: "register",
      context: { user: `${createdUser.lastName} ${createdUser.firstName} ` },
    });
  }

  async signOut(userId: string): Promise<void> {
    await this.revokeTokenPair(userId);
  }

  async forgotPassword(
    { emailOrPhone }: ForgotPasswordPayload,
    ipAddress: string,
  ): Promise<Omit<ResetPasswordTransaction, "otpCode">> {
    const user = await this.userService.find({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) throw new BadRequestException(ErrorMessage.USER_NOT_FOUND);

    const { otpCode, ...transaction } = await this.createResetPasswordTransaction(user._id, ipAddress);

    await this.mailService.sendMail({
      to: user.email,
      subject: MailSubject.RESET_PASSWORD,
      template: "forgot-password",
      context: { user: `${user.lastName} ${user.firstName}`, otpCode },
    });

    return transaction;
  }

  async resetPassword(payload: ResetPasswordPayload, ipAddress: string): Promise<User> {
    const { newPassword, userId, otpCode } = payload;

    const cachedTransaction = await this.getCachedResetPasswordTransaction(userId);
    if (!cachedTransaction) throw new BadRequestException(ErrorMessage.INVALID_RESET_PASSWORD_SESSION);

    if (otpCode !== cachedTransaction.otpCode || ipAddress !== cachedTransaction.ipAddress) {
      throw new BadRequestException(ErrorMessage.INVALID_OTP);
    }

    const hashedPassword = await this.userService.hashPassword(newPassword);
    const updatedUser = await this.userService.findAndUpdateUser({ _id: userId }, { password: hashedPassword });

    await this.revokeResetPasswordTransaction(userId);

    return updatedUser;
  }

  async refreshToken(refreshToken: string, requestAgent: [string, string], ipAddress: string): Promise<TokenPair> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tokenPayload: JwtPayload = this.jwtRefreshService.decodeToken(refreshToken);

    if (!tokenPayload) {
      throw new UnauthorizedException();
    }

    this.revokeTokenPair(tokenPayload.userId);

    const newTokenPair: TokenPair = this.generateTokenPair({
      role: tokenPayload.role,
      userId: tokenPayload.userId,
    });

    this.cacheTokenPair(tokenPayload.userId, newTokenPair);

    this.userService.createAccessRecord(tokenPayload.userId, requestAgent, ipAddress);

    return newTokenPair;
  }

  /* Helper functions */

  private generateTokenPair(payload: JwtPayload): TokenPair {
    return {
      accessToken: this.jwtAccessService.generateToken(payload),
      refreshToken: this.jwtRefreshService.generateToken(payload),
    };
  }

  private async cacheTokenPair(userId: string, tokenPair: TokenPair): Promise<void> {
    const decodedAccessToken = this.jwtAccessService.decodeToken(tokenPair.accessToken);

    const currentTime = Math.floor(Date.now() / 1000);
    const tokenValidTime = (decodedAccessToken["exp"] - currentTime) * 1000;

    await this.cacheService.set(joinCacheKey(ACCESS_PAIR_CACHE_PREFIX, userId), tokenPair, tokenValidTime);
  }

  private async getCachedTokenPair(userId: string): Promise<TokenPair> {
    return await this.cacheService.get<TokenPair>(joinCacheKey(ACCESS_PAIR_CACHE_PREFIX, userId));
  }

  private async createResetPasswordTransaction(userId: string, ipAddress: string): Promise<ResetPasswordTransaction> {
    const otpCode: string = Array.from({ length: OTP_LENGTH }, () => Math.floor(Math.random() * 10)).join("");
    const transactionId = uuid();

    const transaction: ResetPasswordTransaction = { userId, transactionId, otpCode, ipAddress };

    await this.cacheService.set(joinCacheKey(RESET_PASSOWRD_TRANSACTION_CACHE_PREFIX, userId), transaction, OTP_TTL);

    return transaction;
  }

  private async getCachedResetPasswordTransaction(userId: string): Promise<ResetPasswordTransaction> {
    return await this.cacheService.get(joinCacheKey(RESET_PASSOWRD_TRANSACTION_CACHE_PREFIX, userId));
  }

  private async revokeResetPasswordTransaction(userId: string): Promise<void> {
    await this.cacheService.del(joinCacheKey(RESET_PASSOWRD_TRANSACTION_CACHE_PREFIX, userId));
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
