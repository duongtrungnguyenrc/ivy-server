import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { CollectionFilter, CreateCollectionPayload, GetCollectionResponse } from "@app/models";
import { CollectionGroupService } from "@app/services/collection-group.service";
import { RepositoryService } from "@app/services/repository.service";
import { COLLECTION_CACHE_PREFIX } from "@app/constants";
import { withMutateTransaction } from "@app/utils";
import { CacheService } from "./cache.service";
import { ErrorMessage } from "@app/enums";
import { Collection } from "@app/schemas";

@Injectable()
export class CollectionService extends RepositoryService<Collection> {
  constructor(
    @InjectModel(Collection.name)
    collectionModel: Model<Collection>,
    cacheService: CacheService,
    private readonly groupService: CollectionGroupService,
  ) {
    super(collectionModel, cacheService, COLLECTION_CACHE_PREFIX);
  }

  async createCollection(payload: CreateCollectionPayload): Promise<Collection> {
    return withMutateTransaction<Collection>(this._model, async (session) => {
      const { groupId, ...collection } = payload;

      const [createdCollection] = await this.create(
        [
          {
            ...collection,
          },
        ],
        { session },
      );

      await this.groupService.update(
        groupId,
        {
          $push: {
            collections: createdCollection._id,
          },
        },
        { session },
      );

      return createdCollection;
    });
  }

  async getCollection(id: string, filter: boolean = false): Promise<GetCollectionResponse | Collection> {
    const collection: Collection = await this.find(id, undefined, {
      path: "products",
      populate: {
        path: "options",
        model: "Option",
      },
    });

    if (!collection) {
      throw new BadRequestException(ErrorMessage.COLLECTION_NOT_FOUND);
    }

    if (!filter) return collection;

    const colorsSet: Set<string> = new Set();
    const sizesSet: Set<string> = new Set();
    const materialsSet: Set<string> = new Set();

    for (const product of collection.products) {
      if (product.material && product.material !== "Unknown") {
        materialsSet.add(product.material);
      }

      if (product.options && product.options.length > 0) {
        for (const option of product.options) {
          if (option.colorHexCode) {
            colorsSet.add(option.colorHexCode);
          }
          if (option.size) {
            sizesSet.add(option.size);
          }
        }
      }
    }

    const filterOptions: CollectionFilter = {
      colors: Array.from(colorsSet),
      sizes: Array.from(sizesSet),
      materials: Array.from(materialsSet),
    };

    return { collection, filterOptions };
  }
}
