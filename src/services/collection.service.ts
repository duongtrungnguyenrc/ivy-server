import { BadRequestException, Injectable } from "@nestjs/common";
import { Cache } from "@nestjs/cache-manager";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { CollectionGroupService } from "./collection-group.service";
import { COLLECTION_CACHE_PREFIX, NOT_DELETED_FILTER } from "@app/constants";
import { CreateCollectionPayload, PaginationResponse, UpdateCollectionPayload } from "@app/models";
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
  ) { }

  async createCollection(payload: CreateCollectionPayload): Promise<Collection> {
    const { groupId, ...collection } = payload;

    const createdCollection: Collection = await this.collectionModel.create({
      ...collection,
    });

    this.groupService.addCollection(groupId, createdCollection);

    return createdCollection;
  }

  async updateCollection(id: string, payload: UpdateCollectionPayload): Promise<Collection> {
    const updatedCollection = await this.collectionModel.findByIdAndUpdate(id, payload);

    if (!updatedCollection) throw new BadRequestException(ErrorMessage.COLLECTION_NOT_FOUND);

    return updatedCollection;
  }
  
  async deleteCollection(id: string): Promise<void> {
    const deletedCollection = await this.collectionModel.findByIdAndUpdate(id, { isDeleted: true });

    if (!deletedCollection) throw new BadRequestException(ErrorMessage.COLLECTION_NOT_FOUND);
  }

  async getCollections({
    limit,
    page,
  }: {
    limit?: number;
    page?: number;
  }): Promise<Collection[] | PaginationResponse<Collection>> {
    const baseQuery = this.collectionModel.find(NOT_DELETED_FILTER).sort({ createdAt: -1 });

    if (page) {
      const limited = limit || 10;
      const skip = (page - 1) * limited;

      const [collections, totalDocs] = await Promise.all([
        baseQuery.skip(skip).limit(limited).exec(),
        this.collectionModel.countDocuments(NOT_DELETED_FILTER).exec(),
      ]);

      return {
        meta: {
          page,
          limit,
          pages: Math.ceil(totalDocs / limit),
        },
        data: collections,
      };
    }

    const collections = await baseQuery;

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
