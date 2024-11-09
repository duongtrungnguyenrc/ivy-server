import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";

import { CATEGORY_CACHE_PREFIX, NOT_DELETED_FILTER } from "@app/constants";
import { RepositoryService } from "@app/services/repository.service";
import { CacheService } from "@app/services/cache.service";
import { Category } from "@app/schemas";

@Injectable()
export class CategoryService extends RepositoryService<Category> {
  constructor(
    @InjectModel(Category.name)
    categoryModel: Model<Category>,
    cacheService: CacheService,
  ) {
    super(categoryModel, cacheService, CATEGORY_CACHE_PREFIX);
  }

  async getCategories(): Promise<Array<Category>> {
    return this.findMultiple(
      NOT_DELETED_FILTER,
      undefined,
      {
        path: "collectionGroups",
        match: NOT_DELETED_FILTER,
        populate: {
          path: "collections",
          model: "Collection",
          match: NOT_DELETED_FILTER,
        },
      },
      { createdAt: -1 },
      false,
      "full",
    );
  }
}
