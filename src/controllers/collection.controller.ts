import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateCollectionPayload } from "@app/models";
import { CollectionService } from "@app/services";
import { JWTAccessAuthGuard } from "@app/guards";
import { HasRole } from "@app/decorators";
import { Collection } from "@app/schemas";

@Controller("collection")
@ApiTags("collection")
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post("/")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBearerAuth()
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
