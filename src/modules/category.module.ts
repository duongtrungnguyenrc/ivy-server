import { Module } from "@nestjs/common";

import { CollectionModule } from "./collection.module";
import { CategoryService } from "@app/services";
import { GroupModule } from "./group.module";
import { CategoryController } from "@app/controllers";

@Module({
  imports: [GroupModule, CollectionModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
