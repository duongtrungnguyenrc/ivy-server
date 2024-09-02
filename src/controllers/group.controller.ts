import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import {
  CreateGroupPayload,
  CreateGroupResponse,
  GetGroupResponse,
  GetGroupsResponse,
} from "@app/models";
import { GroupService } from "@app/services";
import { HasRole } from "@app/decorators";

@Controller("group")
@ApiTags("group")
export class GroupController {
  constructor(private readonly GroupService: GroupService) {}

  @Post("/")
  @HasRole("ADMIN")
  @ApiBody({ type: CreateGroupPayload })
  @ApiResponse({ type: CreateGroupResponse })
  createGroup(@Body() payload: CreateGroupPayload): Promise<CreateGroupResponse> {
    return this.GroupService.createGroup(payload);
  }

  @Get("/")
  getGroups(): Promise<GetGroupsResponse> {
    return this.GroupService.getGroups();
  }

  @Get("/:id")
  getGroup(@Param("id") id: string): Promise<GetGroupResponse> {
    return this.GroupService.getGroup(id);
  }
}
