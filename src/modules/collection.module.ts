import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { CollectionGroupModule } from "./collection-group.module";
import { Collection, CollectionSchema } from "@app/schemas";
import { CollectionController } from "@app/controllers";
import { CollectionService } from "@app/services";

@Module({
  imports: [
    CollectionGroupModule,
    MongooseModule.forFeature([
      {
        name: Collection.name,
        schema: CollectionSchema,
      },
    ]),
  ],
  controllers: [CollectionController],
  providers: [CollectionService],
  exports: [CollectionService],
})
export class CollectionModule {}
