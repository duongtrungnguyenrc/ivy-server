import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateCollectionGroupPayload } from "@app/models";
import { JWTAccessAuthGuard } from "@app/guards";
import { CollectionGroupService } from "@app/services";
import { HasRole } from "@app/decorators";
import { CollectionGroup } from "@app/schemas";

@Controller("group")
@ApiTags("group")
export class CollectionGroupController {
  constructor(private readonly groupService: CollectionGroupService) {}

  @Post("/")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBearerAuth()
  @ApiBody({ type: CreateCollectionGroupPayload })
  @ApiResponse({ type: CollectionGroup })
  createCollectionGroup(@Body() payload: CreateCollectionGroupPayload): Promise<CollectionGroup> {
    return this.groupService.createCollectionGroup(payload);
  }

  @Get("/")
  getCollectionGroups(): Promise<CollectionGroup[]> {
    return this.groupService.getCollectionGroups();
  }

  @Get("/:id")
  getCollectionGroup(@Param("id") id: string): Promise<CollectionGroup> {
    return this.groupService.getCollectionGroup(id);
  }
}
