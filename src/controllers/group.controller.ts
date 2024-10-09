import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateCollectionGroupPayload } from "@app/models";
import { CollectionGroupService } from "@app/services";
import { CollectionGroupMessages } from "@app/enums";
import { CollectionGroup } from "@app/schemas";
import { Auth } from "@app/decorators";

@Controller("group")
@ApiTags("group")
export class CollectionGroupController {
  constructor(private readonly groupService: CollectionGroupService) {}

  @Post("/")
  @Auth(["ADMIN"])
  @ApiBody({ type: CreateCollectionGroupPayload })
  @ApiResponse({ description: CollectionGroupMessages.CREATE_GROUP_SUCCESS, type: CollectionGroup })
  createCollectionGroup(@Body() payload: CreateCollectionGroupPayload): Promise<CollectionGroup> {
    return this.groupService.createCollectionGroup(payload);
  }

  @Get("/")
  @ApiResponse({ description: CollectionGroupMessages.GET_GROUP_SUCCESS, type: CollectionGroup })
  getCollectionGroups(): Promise<CollectionGroup[]> {
    return this.groupService.getCollectionGroups();
  }

  @Get("/:id")
  @ApiResponse({ description: CollectionGroupMessages.GET_GROUP_SUCCESS, type: CollectionGroup })
  getCollectionGroup(@Param("id") id: string): Promise<CollectionGroup> {
    return this.groupService.getCollectionGroup(id);
  }
}
