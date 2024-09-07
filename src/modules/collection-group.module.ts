import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { CollectionGroup, CollectionGroupSchema } from "@app/schemas";
import { CollectionGroupController } from "@app/controllers";
import { CollectionGroupService } from "@app/services";
import { CategoryModule } from "./category.module";

@Module({
  imports: [
    CategoryModule,
    MongooseModule.forFeature([
      {
        name: CollectionGroup.name,
        schema: CollectionGroupSchema,
      },
    ]),
  ],
  controllers: [CollectionGroupController],
  providers: [CollectionGroupService],
  exports: [CollectionGroupService],
})
export class CollectionGroupModule {}
