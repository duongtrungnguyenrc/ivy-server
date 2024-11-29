import { ApiPagination, Auth, AuthUid, Pagination } from "@app/decorators";
import { Body, Controller, Get, Put } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

import { PaginationResponse, UpdateUserPayload } from "@app/models";
import { AccessRecord, User } from "@app/schemas";
import { Role, UserMessages } from "@app/enums";
import { UserService } from "@app/services";

@Controller("user")
@ApiTags("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/admin")
  @ApiPagination()
  async getAminUsers(@Pagination() pagination: Pagination): Promise<PaginationResponse<User>> {
    return await this.userService.findMultiplePaging({ $or: [{ role: Role.ADMIN }, { role: Role.OWNER }] }, pagination);
  }

  @Get("/auth")
  @Auth()
  @ApiResponse({ description: UserMessages.GET_AUTH_CUSTOMER_SUCCESS, type: User })
  async getAuthUser(@AuthUid() userId: string): Promise<User> {
    return await this.userService.getAuthUser(userId);
  }

  @Put("/")
  @ApiResponse({ description: UserMessages.UPDATE_CUSTOMER_SUCCESS, type: User })
  async updateUser(@Body() payload: UpdateUserPayload, @AuthUid() userId: string): Promise<User> {
    return await this.userService.updateUser(payload, userId);
  }

  @Get("/access")
  @ApiPagination()
  @ApiResponse({ description: UserMessages.GET_ACCESS_HISTORY_SUCCESS, type: PaginationResponse<AccessRecord> })
  async getAccessHistory(
    @AuthUid() userId: string,
    @Pagination() pagination: Pagination,
  ): Promise<PaginationResponse<AccessRecord>> {
    return await this.userService.getAccessHistory(userId, pagination);
  }
}
