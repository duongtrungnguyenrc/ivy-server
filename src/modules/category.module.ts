import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Category, CategorySchema } from "@app/schemas";
import { CategoryController } from "@app/controllers";
import { CategoryService } from "@app/services";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
