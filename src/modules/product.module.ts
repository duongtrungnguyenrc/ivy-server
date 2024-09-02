import { ProductController } from "@app/controllers";
import {
  Cost,
  CostSchema,
  Option,
  OptionSchema,
  Product,
  ProductSchema,
} from "@app/schemas";
import { ProductService } from "@app/services";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CollectionModule } from "./collection.module";

@Module({
  imports: [
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
})
export class ProductModule {}
