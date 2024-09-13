import { BadRequestException, Injectable } from "@nestjs/common";
import { Cache } from "@nestjs/cache-manager";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { CollectionGroupService } from "./collection-group.service";
import { COLLECTION_CACHE_PREFIX } from "@app/constants";
import { CreateCollectionPayload } from "@app/models";
import { Collection, Product } from "@app/schemas";
import { joinCacheKey } from "@app/utils";
import { ErrorMessage } from "@app/enums";

@Injectable()
export class CollectionService {
  constructor(
    @InjectModel(Collection.name)
    private readonly collectionModel: Model<Collection>,
    private readonly groupService: CollectionGroupService,
    private readonly cacheManager: Cache,
  ) {}

  async createCollection(payload: CreateCollectionPayload): Promise<Collection> {
    const { groupId, ...collection } = payload;

    const createdCollection: Collection = await this.collectionModel.create({
      ...collection,
    });

    this.groupService.addCollection(groupId, createdCollection);

    return createdCollection;
  }

  async getCollections(): Promise<Collection[]> {
    const collections: Collection[] = await this.collectionModel.find();

    return collections;
  }

  async getCollection(id: string): Promise<Collection> {
    const collection: Collection = await this.findCollectionById(id);

    if (!collection) {
      throw new BadRequestException(ErrorMessage.COLLECTION_NOT_FOUND);
    }

    return collection;
  }

  async addProduct(id: string, product: Product): Promise<Collection> {
    const updatedCollection: Collection = await this.collectionModel.findByIdAndUpdate(id, {
      $push: {
        products: new Types.ObjectId(product._id),
      },
    });

    return updatedCollection;
  }

  async findCollectionById(
    id: string,
    populate: (keyof Collection)[] = [],
    force: boolean = false,
  ): Promise<Collection> {
    if (!force) {
      const collectionCacheKey: string = joinCacheKey(COLLECTION_CACHE_PREFIX, id);

      const cachedCollection: Collection = await this.cacheManager.get(collectionCacheKey);

      if (cachedCollection) return cachedCollection;
    }

    const collection: Collection = await this.collectionModel.findOne({ _id: id }).populate(populate);

    return collection;
  }
}
