import { BadRequestException, Injectable } from "@nestjs/common";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { CreateCollectionGroupPayload, UpdateCollectionGroupPayload } from "@app/models";
import { RepositoryService } from "@app/services/repository.service";
import { COLLECTION_GROUP_CACHE_PREFIX } from "@app/constants";
import { CacheService } from "@app/services/cache.service";
import { CategoryService } from "./category.service";
import { withMutateTransaction } from "@app/utils";
import { CollectionGroup } from "@app/schemas";
import { ErrorMessage } from "@app/enums";

@Injectable()
export class CollectionGroupService extends RepositoryService<CollectionGroup> {
  constructor(
    private readonly categoryService: CategoryService,
    @InjectModel(CollectionGroup.name)
    collectionGroupModel: Model<CollectionGroup>,
    readonly cacheService: CacheService,
  ) {
    super(collectionGroupModel, cacheService, COLLECTION_GROUP_CACHE_PREFIX);
  }

  async createCollectionGroup(payload: CreateCollectionGroupPayload): Promise<CollectionGroup> {
    return withMutateTransaction<CollectionGroup>(this._model, async (session) => {
      const { categoryId, ...collection } = payload;

      const [createdCollectionGroup] = await this.create(
        [
          {
            ...collection,
            collections: collection.collections.map((id) => new Types.ObjectId(id)),
          },
        ],
        { session },
      );

      await this.categoryService.update(
        categoryId,
        {
          $push: {
            collectionGroups: createdCollectionGroup._id,
          },
        },
        { session },
      );

      return createdCollectionGroup;
    });
  }

  async updateCollectionGroup(updates: UpdateCollectionGroupPayload): Promise<CollectionGroup> {
    const { _id, ...group } = updates;

    if (!_id) {
      throw new BadRequestException(ErrorMessage.COLLECTION_GROUP_REQUIRED);
    }

    const updatedCollectionGroup: CollectionGroup = await this.update(
      _id,
      {
        ...group,
        collections: group.collections.map((id) => new Types.ObjectId(id)),
      },
      { new: true },
    );

    if (!updatedCollectionGroup) {
      throw new BadRequestException(ErrorMessage.COLLECTION_GROUP_NOT_FOUND);
    }

    return updatedCollectionGroup;
  }
}
