import { BadRequestException, Injectable } from "@nestjs/common";

import { Category, CollectionGroup } from "@app/schemas";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateCategoryPayload, PaginationResponse } from "@app/models";
import { NOT_DELETED_FILTER } from "@app/constants";
import { ErrorMessage } from "@app/enums";

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
  ) {}

  async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    return await this.categoryModel.create(payload);
  }

  async updateCategory(id: string, payload: CreateCategoryPayload): Promise<Category> {
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(id, payload);

    if (!updatedCategory) throw new BadRequestException(ErrorMessage.CATEGORY_NOT_FOUND);

    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    const deletedCategory = await this.categoryModel.findByIdAndUpdate(id, { isDeleted: true });

    if (!deletedCategory) throw new BadRequestException(ErrorMessage.CATEGORY_NOT_FOUND);
  }

  async getCategories(page?: number, limit?: number): Promise<Category[] | PaginationResponse<Category>> {
    const baseQuery = this.categoryModel
      .find(NOT_DELETED_FILTER)
      .populate({
        path: "collectionGroups",
        match: NOT_DELETED_FILTER,
        populate: {
          path: "collections",
          model: "Collection",
          match: NOT_DELETED_FILTER,
        },
      })
      .sort({ createdAt: -1 });

    if (page) {
      const limited = limit || 10;
      const skip = (page - 1) * limited;

      const [paginatedCategories, totalDocs] = await Promise.all([
        baseQuery.skip(skip).limit(limited).exec(),
        this.categoryModel.countDocuments(NOT_DELETED_FILTER).exec(),
      ]);

      return {
        meta: {
          page: Number(page),
          limit: Number(limited),
          pages: Math.ceil(totalDocs / limited),
        },
        data: paginatedCategories,
      };
    }

    const categories: Category[] = await baseQuery;

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
