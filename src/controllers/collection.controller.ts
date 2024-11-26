import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

import { ApiPagination, Auth, Pagination } from "@app/decorators";
import { CollectionService } from "@app/services";
import { CollectionMessages } from "@app/enums";
import { Collection } from "@app/schemas";
import {
  CreateCollectionPayload,
  GetCollectionResponse,
  PaginationResponse,
  UpdateCollectionPayload,
} from "@app/models";
import { NOT_DELETED_FILTER } from "@app/constants";

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
    return this.collectionService.update(id, payload);
  }

  @Delete("/:id")
  @Auth(["ADMIN"])
  @ApiBody({ type: CreateCollectionPayload })
  @ApiResponse({ description: CollectionMessages.DELETE_COLLECTION_SUCCESS })
  @ApiParam({ type: String, name: "id" })
  deleteCollection(@Param("id") id: string): Promise<boolean> {
    return this.collectionService.delete(id);
  }

  @Get("/")
  @ApiPagination()
  @ApiResponse({ description: CollectionMessages.GET_COLLECTION_SUCCESS, type: PaginationResponse<Collection> })
  getCollections(@Pagination() pagination: Pagination): Promise<PaginationResponse<Collection>> {
    return this.collectionService.findMultiplePaging({}, pagination);
  }

  @Get("/all")
  @ApiPagination()
  @ApiResponse({ description: CollectionMessages.GET_COLLECTION_SUCCESS, type: [Collection] })
  getAllCollections(): Promise<PaginationResponse<Collection> | Collection[]> {
    return this.collectionService.findMultiple(NOT_DELETED_FILTER, ["-products"]);
  }

  @Get("/:id")
  @ApiParam({ type: String, name: "id", description: CollectionMessages.COLLECTION_ID, required: true })
  @ApiQuery({ type: Boolean, name: "filter", description: CollectionMessages.INCLUDE_FILTER, required: false })
  @ApiResponse({ description: CollectionMessages.GET_COLLECTION_SUCCESS, type: GetCollectionResponse || Collection })
  getCollection(
    @Param("id") id: string,
    @Query("filter") filter: boolean,
  ): Promise<GetCollectionResponse | Collection> {
    return this.collectionService.getCollection(id, filter);
  }
}
