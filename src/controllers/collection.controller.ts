import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateCollectionPayload } from "@app/models";
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

  @Get("/")
  @ApiResponse({ description: CollectionMessages.GET_COLLECTION_SUCCESS, type: Collection })
  getCollections(): Promise<Collection[]> {
    return this.collectionService.getCollections();
  }

  @Get("/:id")
  @ApiResponse({ description: CollectionMessages.GET_COLLECTION_SUCCESS, type: Collection })
  getCollection(@Param("id") id: string): Promise<Collection> {
    return this.collectionService.getCollection(id);
  }
}
