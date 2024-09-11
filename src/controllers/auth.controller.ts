import { Body, Controller, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { JWTAccessAuthGuard, JWTRefreshAuthGuard, LocalAuthGuard } from "@app/guards";
import { SignInPayload, SignUpPayload, ForgotPasswordPayload, ResetPasswordPayload } from "@app/models";
import { AuthService } from "@app/services";

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
  forgotPassword(@Body() payload: ForgotPasswordPayload): Promise<void> {
    return this.authService.forgotPassword(payload);
  }

  @Post("reset-password")
  @ApiBody({
    type: ResetPasswordPayload,
  })
  resetPassword(@Body() payload: ResetPasswordPayload): Promise<void> {
    return this.authService.resetPassword(payload);
  }
}
