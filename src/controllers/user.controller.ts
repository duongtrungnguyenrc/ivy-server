import { Body, Controller, Get, Put } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import { Auth, AuthUid, Pagination } from "@app/decorators";
import { AccessRecord, User } from "@app/schemas";
import { UpdateUserPayload } from "@app/models";
import { UserService } from "@app/services";

@Controller("user")
@ApiTags("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Auth()
  @ApiResponse({ type: User })
  @Get("/auth")
  getAuthUser(@AuthUid() userId: string): Promise<User> {
    return this.userService.getAuthUser(userId);
  }

  @Auth()
  @ApiResponse({ type: User })
  @Put("/")
  updateUser(@Body() payload: UpdateUserPayload, @AuthUid() userId: string): Promise<User> {
    return this.userService.updateUser(payload, userId);
  }

  @Auth()
  @Get("/access")
  @ApiResponse({ type: [AccessRecord] })
  getAccessHistory(@AuthUid() userId: string, @Pagination() pagination: Pagination) {
    return this.userService.getAccessHistory(userId, pagination);
  }
}
