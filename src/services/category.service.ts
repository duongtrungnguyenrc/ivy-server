import { Injectable } from "@nestjs/common";

import { Category, CollectionGroup } from "@app/schemas";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateCategoryPayload } from "@app/models";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
  ) {}

  async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    return await this.categoryModel.create(payload);
  }

  async getCategories(): Promise<Category[]> {
    const categories: Category[] = await this.categoryModel.find().populate({
      path: "collectionGroups",
      populate: {
        path: "collections",
        model: "Collection",
      },
    });

    return categories;
  }

  async addGroup(id: string, group: CollectionGroup): Promise<Category> {
    const updatedCategory: Category = await this.categoryModel.findByIdAndUpdate(id, {
      $push: {
        collectionGroups: new Types.ObjectId(group._id),
      },
    });

    return updatedCategory;
  }
}
