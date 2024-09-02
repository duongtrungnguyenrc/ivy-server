import { Body, Controller, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

import { JWTAccessAuthGuard, LocalAuthGuard } from "@app/guards";
import { AuthService } from "@app/services";
import {
  RefreshTokenResponse,
  SignInPayload,
  SignInResponse,
  SignOutResponse,
  SignUpPayload,
  SignUpResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from "@app/models";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({
    type: SignInPayload,
  })
  @ApiResponse({
    type: SignInResponse,
  })
  @Post("sign-in")
  @HttpCode(200)
  signIn(@Body() payload: SignInPayload): Promise<SignInResponse> {
    return this.authService.signIn(payload);
  }

  @Post("sign-up")
  @ApiBody({
    type: SignUpPayload,
  })
  @ApiResponse({
    type: SignUpResponse,
  })
  signUp(@Body() payload: SignUpPayload): Promise<SignUpResponse> {
    return this.authService.signUp(payload);
  }

  @Post("sign-out")
  @UseGuards(JWTAccessAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    type: SignOutResponse,
  })
  signOut(@Req() request: Request) {
    return this.authService.signOut(request);
  }

  @Post("refresh-token")
  @UseGuards(JWTAccessAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    type: RefreshTokenResponse,
  })
  refreshToken(@Req() request: Request): Promise<RefreshTokenResponse> {
    return this.authService.refreshToken(request);
  }

  @Post("forgot-password")
  @ApiBody({
    type: ForgotPasswordPayload,
  })
  @ApiResponse({
    type: ForgotPasswordResponse,
  })
  forgotPassword(@Body() payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
    return this.authService.forgotPassword(payload);
  }

  @Post("reset-password")
  @ApiBody({
    type: ResetPasswordPayload,
  })
  @ApiResponse({
    type: ResetPasswordResponse,
  })
  resetPassword(@Body() payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    return this.authService.resetPassword(payload);
  }
}
