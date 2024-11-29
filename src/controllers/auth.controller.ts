import { Body, Controller, HttpCode, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { SignInPayload, SignUpPayload, ForgotPasswordPayload, ResetPasswordPayload } from "@app/models";
import { Auth, AuthToken, AuthUid, IpAddress, RequestAgent } from "@app/decorators";
import { JWTRefreshAuthGuard, LocalAuthGuard } from "@app/guards";
import { AuthService } from "@app/services";
import { AuthMessages } from "@app/enums";
import { User } from "@app/schemas";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post("sign-in")
  @HttpCode(200)
  @ApiBody({
    type: SignInPayload,
  })
  @ApiResponse({ description: AuthMessages.SIGN_IN_SUCCESS })
  async signIn(
    @Body() payload: SignInPayload,
    @RequestAgent() requestAgent: [string, string],
    @IpAddress() ipAddress: string,
  ): Promise<TokenPair> {
    return await this.authService.signIn(payload, requestAgent, ipAddress);
  }

  @Post("/sign-up")
  @ApiBody({
    type: SignUpPayload,
  })
  @ApiResponse({ description: AuthMessages.SIGN_UP_SUCCESS })
  async signUp(@Body() payload: SignUpPayload): Promise<void> {
    return await this.authService.signUp(payload);
  }

  @Post("/admin/sign-up")
  @Auth(["ADMIN"])
  @ApiBody({
    type: SignUpPayload,
  })
  @ApiResponse({ description: AuthMessages.SIGN_UP_SUCCESS })
  async signUpAdmin(@Body() payload: SignUpPayload): Promise<boolean> {
    return await this.authService.signUpAdmin(payload);
  }

  @Post("/sign-out")
  @Auth()
  @ApiResponse({ description: AuthMessages.SIGN_OUT_SUCCESS })
  async signOut(@AuthUid() userId: string): Promise<void> {
    return await this.authService.signOut(userId);
  }

  @Post("/refresh-token")
  @Auth(["*"], JWTRefreshAuthGuard)
  @ApiResponse({ description: AuthMessages.REFRESH_TOKEN_SUCCESS })
  async refreshToken(
    @AuthToken() refreshToken: string,
    @RequestAgent() requestAgent: [string, string],
    @IpAddress() ipAddress: string,
  ): Promise<TokenPair> {
    return await this.authService.refreshToken(refreshToken, requestAgent, ipAddress);
  }

  @Post("/forgot-password")
  @ApiBody({
    type: ForgotPasswordPayload,
  })
  @ApiResponse({ description: AuthMessages.FORGOT_PASSWORD_SUCCESS })
  async forgotPassword(
    @Body() payload: ForgotPasswordPayload,
    @IpAddress() ipAddress: string,
  ): Promise<Omit<ResetPasswordTransaction, "otpCode">> {
    return await this.authService.forgotPassword(payload, ipAddress);
  }

  @Post("/reset-password")
  @ApiBody({
    type: ResetPasswordPayload,
  })
  @ApiResponse({ description: AuthMessages.RESET_PASSWORD_SUCCESS, type: User })
  async resetPassword(@Body() payload: ResetPasswordPayload, @IpAddress() ipAddress: string): Promise<User> {
    return await this.authService.resetPassword(payload, ipAddress);
  }

  @Post("/lock/:id")
  @Auth()
  @ApiParam({
    name: "id",
    description: AuthMessages.TARGET_UID,
    required: false,
  })
  async lockAccount(@AuthUid() authUserId: string, @Param("id") targetUserId?: string): Promise<boolean> {
    return await this.authService.changeAccountLockStatus(true, authUserId, targetUserId);
  }

  @Post("/active/:id")
  @Auth()
  @ApiParam({
    name: "id",
    description: AuthMessages.TARGET_UID,
    required: false,
  })
  async activeAccount(@AuthUid() authUserId: string, @Param("id") targetUserId?: string): Promise<boolean> {
    return await this.authService.changeAccountLockStatus(false, authUserId, targetUserId);
  }
}
