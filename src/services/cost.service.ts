import { Injectable } from "@nestjs/common";
import { RepositoryService } from "@app/services/repository.service";
import { Cost } from "@app/schemas";
import { InjectModel } from "@nestjs/mongoose";
import { CacheService } from "@app/services/cache.service";
import { Model } from "mongoose";
import { COST_CACHE_PREFIX } from "@app/constants";

@Injectable()
export class CostService extends RepositoryService<Cost> {
  constructor(
    @InjectModel(Cost.name) private readonly costModel: Model<Cost>,
    cacheService: CacheService,
  ) {
    super(costModel, cacheService, COST_CACHE_PREFIX);
  }
}
