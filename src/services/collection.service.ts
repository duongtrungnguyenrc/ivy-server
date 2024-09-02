import { InjectModel } from "@nestjs/mongoose";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Model } from "mongoose";

import {
  CreateCollectionPayload,
  CreateCollectionResponse,
  GetCollectionResponse,
  GetCollectionsResponse,
} from "@app/models";
import { Collection, Group } from "@app/schemas";
import { GroupService } from "./group.service";

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(Collection.name)
    private readonly collectionModel: Model<Collection>,
    private readonly groupService: GroupService,
  ) {}

  async createCollection(payload: CreateCollectionPayload): Promise<CreateCollectionResponse> {
    const { groupId, ...collection } = payload;

    const createdCollection: Collection = await this.collectionModel.create({
      ...collection,
    });

    this.groupService.updateGroup({ _id: groupId, collections: [createdCollection] }, true);

    const response: CreateCollectionResponse = {
      data: createdCollection,
      message: "Create collection success",
    };

    return response;
  }

  async getCollections(): Promise<GetCollectionsResponse> {
    const collections: Collection[] = await this.collectionModel.find();

    const response: GetCollectionsResponse = {
      data: collections,
      message: "Get collections success",
    };

    return response;
  }

  async getCollection(id: string): Promise<GetCollectionResponse> {
    const collection: Collection = await this.collectionModel.findById(id);

    if (!collection) {
      throw new BadRequestException("Collection not found");
    }

    const response: GetCollectionResponse = {
      data: collection,
      message: "Get collections success",
    };

    return response;
  }

  async findCollectionById(id: string): Promise<Collection> {
    return await this.collectionModel.findById(id);
  }
}
