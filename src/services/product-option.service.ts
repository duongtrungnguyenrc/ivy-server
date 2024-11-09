import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";

import { RepositoryService } from "@app/services/repository.service";
import { PRODUCT_OPTION_CACHE_PREFIX } from "@app/constants";
import { CacheService } from "@app/services/cache.service";
import { Option } from "@app/schemas";

@Injectable()
export class ProductOptionService extends RepositoryService<Option> {
  constructor(@InjectModel(Option.name) optionModel: Model<Option>, cacheService: CacheService) {
    super(optionModel, cacheService, PRODUCT_OPTION_CACHE_PREFIX);
  }
}
