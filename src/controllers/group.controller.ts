import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import {
  CreateCollectionGroupPayload,
  PaginationResponse,
  UpdateCollectionGroupPayload,
  UpdateProductPayload,
} from "@app/models";
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
  deleteCollectionGroup(@Param("id") id: string): Promise<void> {
    return this.groupService.deleteCollectionGroup(id);
  }

  @Get("/")
  @ApiResponse({ description: CollectionGroupMessages.GET_GROUP_SUCCESS, type: CollectionGroup })
  getCollectionGroups(
    @Query("page") page: number,
    @Query("limit") limit: number,
  ): Promise<CollectionGroup[] | PaginationResponse<CollectionGroup>> {
    return this.groupService.getCollectionGroups(page, limit);
  }

  @Get("/:id")
  @ApiResponse({ description: CollectionGroupMessages.GET_GROUP_SUCCESS, type: CollectionGroup })
  getCollectionGroup(@Param("id") id: string): Promise<CollectionGroup> {
    return this.groupService.getCollectionGroup(id);
  }
}
