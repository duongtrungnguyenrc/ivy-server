import { JWTAccessAuthGuard } from "@app/guards";
import { User } from "@app/schemas";
import { UserService } from "@app/services";
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

@Controller("user")
@ApiTags("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JWTAccessAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: User })
  @Get("/auth")
  tokenAuth(@Req() request: Request): Promise<User> {
    return this.userService.findUserFromAuth(request);
  }
}
