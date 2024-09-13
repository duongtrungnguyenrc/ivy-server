import { Body, Controller, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { SignInPayload, SignUpPayload, ForgotPasswordPayload, ResetPasswordPayload } from "@app/models";
import { JWTAccessAuthGuard, JWTRefreshAuthGuard, LocalAuthGuard } from "@app/guards";
import { AuthService } from "@app/services";
import { User } from "@app/schemas";
import { IpAddress } from "@app/decorators";

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
  signIn(@Body() payload: SignInPayload): Promise<TokenPair> {
    return this.authService.signIn(payload);
  }

  @Post("sign-up")
  @ApiBody({
    type: SignUpPayload,
  })
  signUp(@Body() payload: SignUpPayload): Promise<void> {
    return this.authService.signUp(payload);
  }

  @Post("sign-out")
  @UseGuards(JWTAccessAuthGuard)
  @ApiBearerAuth()
  signOut(@Req() request: Request): Promise<void> {
    return this.authService.signOut(request);
  }

  @Post("refresh-token")
  @UseGuards(JWTRefreshAuthGuard)
  @ApiBearerAuth()
  refreshToken(@Req() request: Request): Promise<TokenPair> {
    return this.authService.refreshToken(request);
  }

  @Post("forgot-password")
  @ApiBody({
    type: ForgotPasswordPayload,
  })
  forgotPassword(
    @Body() payload: ForgotPasswordPayload,
    @IpAddress() ipAddress: string,
  ): Promise<Omit<ResetPasswordTransaction, "otpCode">> {
    console.log(ipAddress);

    return this.authService.forgotPassword(payload, ipAddress);
  }

  @Post("reset-password")
  @ApiBody({
    type: ResetPasswordPayload,
  })
  resetPassword(@Body() payload: ResetPasswordPayload, @IpAddress() ipAddress: string): Promise<User> {
    return this.authService.resetPassword(payload, ipAddress);
  }
}
