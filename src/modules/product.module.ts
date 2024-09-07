import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { Cost, CostSchema, Option, OptionSchema, Product, ProductSchema } from "@app/schemas";
import { CollectionModule } from "./collection.module";
import { ProductController } from "@app/controllers";
import { ProductService } from "@app/services";
import { GroupModule } from "./group.module";

@Module({
  imports: [
    GroupModule,
    CollectionModule,
    MongooseModule.forFeature([
      {
        name: Product.name,
        schema: ProductSchema,
      },
      {
        name: Option.name,
        schema: OptionSchema,
      },
      {
        name: Cost.name,
        schema: CostSchema,
      },
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
