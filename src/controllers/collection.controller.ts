import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateCollectionPayload } from "@app/models";
import { CollectionService } from "@app/services";
import { Auth } from "@app/decorators";
import { Collection } from "@app/schemas";

@Controller("collection")
@ApiTags("collection")
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post("/")
  @Auth(["ADMIN"])
  @ApiBody({ type: CreateCollectionPayload })
  @ApiResponse({ type: Collection })
  createCollection(@Body() payload: CreateCollectionPayload): Promise<Collection> {
    return this.collectionService.createCollection(payload);
  }

  @Get("/")
  getCollections(): Promise<Collection[]> {
    return this.collectionService.getCollections();
  }

  @Get("/:id")
  getCollection(@Param("id") id: string): Promise<Collection> {
    return this.collectionService.getCollection(id);
  }
}
