import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateGroupPayload } from "@app/models";
import { JWTAccessAuthGuard } from "@app/guards";
import { GroupService } from "@app/services";
import { HasRole } from "@app/decorators";
import { Group } from "@app/schemas";

@Controller("group")
@ApiTags("group")
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post("/")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBearerAuth()
  @ApiBody({ type: CreateGroupPayload })
  @ApiResponse({ type: Group })
  createGroup(@Body() payload: CreateGroupPayload): Promise<Group> {
    return this.groupService.createGroup(payload);
  }

  @Get("/")
  getGroups(): Promise<Group[]> {
    return this.groupService.getGroups();
  }

  @Get("/:id")
  getGroup(@Param("id") id: string): Promise<Group> {
    return this.groupService.getGroup(id);
  }
}
