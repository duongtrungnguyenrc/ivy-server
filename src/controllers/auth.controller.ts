import { Body, Controller, Post, UseGuards } from "@nestjs/common";

import {
  SignInPayload,
  SignInResponse,
  SignUpPayload,
  SignUpResponse,
} from "@app/data";
import { LocalAuthGuard } from "@app/guards";
import { AuthService } from "@app/services";
import { ApiTags } from "@nestjs/swagger";

@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post("sign-in")
  signIn(@Body() payload: SignInPayload): Promise<SignInResponse> {
    return this.authService.signIn(payload);
  }

  @Post("sign-up")
  signUp(@Body() payload: SignUpPayload): Promise<SignUpResponse> {
    return this.authService.signUp(payload);
  }

  refreshToken() {}

  forgotPassword() {}

  resetPassword() {}
}
