import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { Cost, CostSchema, Option, OptionSchema, Product, ProductSchema } from "@app/schemas";
import { ProductOptionService, ProductService, CostService } from "@app/services";
import { CollectionGroupModule } from "@app/modules/collection-group.module";
import { CollectionModule } from "@app/modules/collection.module";
import { ProductController } from "@app/controllers";

@Module({
  imports: [
    CollectionGroupModule,
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
  providers: [ProductService, ProductOptionService, CostService],
  exports: [ProductService, ProductOptionService, CostService],
})
export class ProductModule {}
