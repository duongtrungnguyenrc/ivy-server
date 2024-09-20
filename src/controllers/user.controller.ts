import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AuthUid, Pagination } from "@app/decorators";
import { AccessRecord, User } from "@app/schemas";
import { JWTAccessAuthGuard } from "@app/guards";
import { UpdateUserPayload } from "@app/models";
import { UserService } from "@app/services";

@Controller("user")
@ApiTags("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JWTAccessAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: User })
  @Get("/auth")
  getAuthUser(@AuthUid() userId: string): Promise<User> {
    return this.userService.getAuthUser(userId);
  }

  @UseGuards(JWTAccessAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: User })
  @Put("/")
  updateUser(@Body() payload: UpdateUserPayload, @AuthUid() userId: string): Promise<User> {
    return this.userService.updateUser(payload, userId);
  }

  @UseGuards(JWTAccessAuthGuard)
  @ApiBearerAuth()
  @Get("/access")
  @ApiResponse({ type: [AccessRecord] })
  getAccessHistory(@AuthUid() userId: string, @Pagination() pagination: Pagination) {
    return this.userService.getAccessHistory(userId, pagination);
  }
}
