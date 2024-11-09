import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CollectionGroupService } from "@app/services";
import { CollectionGroupMessages } from "@app/enums";
import { Auth, Pagination } from "@app/decorators";
import { CollectionGroup } from "@app/schemas";
import {
  CreateCollectionGroupPayload,
  PaginationResponse,
  UpdateCollectionGroupPayload,
  UpdateProductPayload,
} from "@app/models";

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

  @Put("/")
  @Auth(["ADMIN"])
  @ApiBody({ type: UpdateProductPayload })
  @ApiResponse({ description: CollectionGroupMessages.UPDATE_GROUP_SUCCESS, type: CollectionGroup })
  updateCollectionGroup(@Body() payload: UpdateCollectionGroupPayload): Promise<CollectionGroup> {
    return this.groupService.updateCollectionGroup(payload);
  }

  @Delete("/:id")
  @Auth(["ADMIN"])
  @ApiResponse({ description: CollectionGroupMessages.DELETE_GROUP_SUCCESS })
  @ApiParam({ type: String, name: "id" })
  deleteCollectionGroup(@Param("id") id: string): Promise<boolean> {
    return this.groupService.safeDelete(id);
  }

  @Get("/")
  @ApiResponse({ description: CollectionGroupMessages.GET_GROUP_SUCCESS, type: CollectionGroup })
  getCollectionGroups(
    @Pagination() pagination: Pagination,
  ): Promise<CollectionGroup[] | PaginationResponse<CollectionGroup>> {
    return this.groupService.findMultiplePaging({}, pagination);
  }

  @Get("/:id")
  @ApiResponse({ description: CollectionGroupMessages.GET_GROUP_SUCCESS, type: CollectionGroup })
  getCollectionGroup(@Param("id") id: string): Promise<CollectionGroup> {
    return this.groupService.find(id);
  }
}
