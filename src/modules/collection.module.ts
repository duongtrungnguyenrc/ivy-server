import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { Collection, CollectionSchema } from "@app/schemas";
import { CollectionController } from "@app/controllers";
import { CollectionService } from "@app/services";
import { GroupModule } from "./group.module";

@Module({
  imports: [
    GroupModule,
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
