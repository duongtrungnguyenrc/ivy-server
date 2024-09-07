import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateGroupPayload, CreateGroupResponse, GetGroupResponse, GetGroupsResponse } from "@app/models";
import { GroupService } from "@app/services";
import { HasRole } from "@app/decorators";
import { JWTAccessAuthGuard } from "@app/guards";

@Controller("group")
@ApiTags("group")
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post("/")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBearerAuth()
  @ApiBody({ type: CreateGroupPayload })
  @ApiResponse({ type: CreateGroupResponse })
  createGroup(@Body() payload: CreateGroupPayload): Promise<CreateGroupResponse> {
    return this.groupService.createGroup(payload);
  }

  @Get("/")
  getGroups(): Promise<GetGroupsResponse> {
    return this.groupService.getGroups();
  }

  @Get("/:id")
  getGroup(@Param("id") id: string): Promise<GetGroupResponse> {
    return this.groupService.getGroup(id);
  }
}
