import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateCollectionPayload, PaginationResponse, UpdateCollectionPayload } from "@app/models";
import { CollectionService } from "@app/services";
import { CollectionMessages } from "@app/enums";
import { Collection } from "@app/schemas";
import { Auth } from "@app/decorators";

@Controller("collection")
@ApiTags("collection")
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post("/")
  @Auth(["ADMIN"])
  @ApiBody({ type: CreateCollectionPayload })
  @ApiResponse({ description: CollectionMessages.CREATE_COLLECTION_SUCCESS, type: Collection })
  createCollection(@Body() payload: CreateCollectionPayload): Promise<Collection> {
    return this.collectionService.createCollection(payload);
  }

  @Put("/:id")
  @Auth(["ADMIN"])
  @ApiBody({ type: UpdateCollectionPayload })
  @ApiResponse({ description: CollectionMessages.UPDATE_COLLECTION_SUCCESS, type: Collection })
  @ApiParam({ type: String, name: "id" })
  updateCollection(@Param("id") id: string, @Body() payload: UpdateCollectionPayload): Promise<Collection> {
    return this.collectionService.updateCollection(id, payload);
  }

  @Delete("/:id")
  @Auth(["ADMIN"])
  @ApiBody({ type: CreateCollectionPayload })
  @ApiResponse({ description: CollectionMessages.DELETE_COLLECTION_SUCCESS })
  @ApiParam({ type: String, name: "id" })
  deleteCollection(@Param("id") id: string): Promise<void> {
    return this.collectionService.deleteCollection(id);
  }

  @Get("/")
  @ApiResponse({ description: CollectionMessages.GET_COLLECTION_SUCCESS, type: Collection })
  @ApiQuery({ type: Number, name: "page" })
  @ApiQuery({ type: Number, name: "limit" })
  getCollections(
    @Query("page") page: number,
    @Query("limit") limit: number,
  ): Promise<PaginationResponse<Collection> | Collection[]> {
    return this.collectionService.getCollections({ page, limit });
  }

  @Get("/:id")
  @ApiResponse({ description: CollectionMessages.GET_COLLECTION_SUCCESS, type: Collection })
  getCollection(@Param("id") id: string): Promise<Collection> {
    return this.collectionService.getCollection(id);
  }
}
