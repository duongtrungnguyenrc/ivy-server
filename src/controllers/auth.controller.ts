import { Body, Controller, HttpCode, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";

import { SignInPayload, SignUpPayload, ForgotPasswordPayload, ResetPasswordPayload } from "@app/models";
import { JWTAccessAuthGuard, JWTRefreshAuthGuard, LocalAuthGuard } from "@app/guards";
import { AuthToken, AuthUid, IpAddress, RequestAgent } from "@app/decorators";
import { AuthService } from "@app/services";
import { User } from "@app/schemas";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({
    type: SignInPayload,
  })
  @Post("sign-in")
  @HttpCode(200)
  async signIn(
    @Body() payload: SignInPayload,
    @RequestAgent() requestAgent: [string, string],
    @IpAddress() ipAddress: string,
  ): Promise<TokenPair> {
    return await this.authService.signIn(payload, requestAgent, ipAddress);
  }

  @Post("sign-up")
  @ApiBody({
    type: SignUpPayload,
  })
  async signUp(@Body() payload: SignUpPayload): Promise<void> {
    return await this.authService.signUp(payload);
  }

  @Post("sign-out")
  @UseGuards(JWTAccessAuthGuard)
  @ApiBearerAuth()
  async signOut(@AuthUid() userId: string): Promise<void> {
    return await this.authService.signOut(userId);
  }

  @Post("refresh-token")
  @UseGuards(JWTRefreshAuthGuard)
  @ApiBearerAuth()
  async refreshToken(
    @AuthToken() refreshToken: string,
    @RequestAgent() requestAgent: [string, string],
    @IpAddress() ipAddress: string,
  ): Promise<TokenPair> {
    return await this.authService.refreshToken(refreshToken, requestAgent, ipAddress);
  }

  @Post("forgot-password")
  @ApiBody({
    type: ForgotPasswordPayload,
  })
  async forgotPassword(
    @Body() payload: ForgotPasswordPayload,
    @IpAddress() ipAddress: string,
  ): Promise<Omit<ResetPasswordTransaction, "otpCode">> {
    return await this.authService.forgotPassword(payload, ipAddress);
  }

  @Post("reset-password")
  @ApiBody({
    type: ResetPasswordPayload,
  })
  async resetPassword(@Body() payload: ResetPasswordPayload, @IpAddress() ipAddress: string): Promise<User> {
    return await this.authService.resetPassword(payload, ipAddress);
  }
}
