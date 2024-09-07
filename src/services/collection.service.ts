import { InjectModel } from "@nestjs/mongoose";
import { BadRequestException, Injectable } from "@nestjs/common";
import { Model } from "mongoose";

import { CreateCollectionPayload } from "@app/models";
import { Collection, Group } from "@app/schemas";
import { GroupService } from "./group.service";

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(Collection.name)
    private readonly collectionModel: Model<Collection>,
    private readonly groupService: GroupService,
  ) {}

  async createCollection(payload: CreateCollectionPayload): Promise<Collection> {
    const { groupId, ...collection } = payload;

    const group: Group = await this.groupService.findGroupById(groupId);

    if (!group) {
      throw new BadRequestException(`Nhóm sản phẩm không tồn tại`);
    }

    const createdCollection: Collection = await this.collectionModel.create({
      ...collection,
    });

    this.groupService.updateGroup({ _id: groupId, collections: [createdCollection] });

    if (!group) {
      throw new BadRequestException("Nhóm sản phẩm không tồn tại");
    }

    return createdCollection;
  }

  async getCollections(): Promise<Collection[]> {
    const collections: Collection[] = await this.collectionModel.find();

    return collections;
  }

  async getCollection(id: string): Promise<Collection> {
    const collection: Collection = await this.collectionModel.findById(id);

    if (!collection) {
      throw new BadRequestException("Collection not found");
    }

    return collection;
  }

  async findCollectionById(id: string): Promise<Collection> {
    return await this.collectionModel.findById(id);
  }
}
