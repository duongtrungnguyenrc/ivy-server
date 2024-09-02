import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import {
  CreateCollectionPayload,
  CreateCollectionResponse,
  GetCollectionResponse,
  GetCollectionsResponse,
} from "@app/models";
import { CollectionService } from "@app/services";
import { HasRole } from "@app/decorators";

@Controller("collection")
@ApiTags("collection")
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post("/")
  @HasRole("ADMIN")
  @ApiBody({ type: CreateCollectionPayload })
  @ApiResponse({ type: CreateCollectionResponse })
  createCollection(@Body() payload: CreateCollectionPayload): Promise<CreateCollectionResponse> {
    return this.collectionService.createCollection(payload);
  }

  @Get("/")
  getCollections(): Promise<GetCollectionsResponse> {
    return this.collectionService.getCollections();
  }

  @Get("/:id")
  getCollection(@Param("id") id: string): Promise<GetCollectionResponse> {
    return this.collectionService.getCollection(id);
  }
}
