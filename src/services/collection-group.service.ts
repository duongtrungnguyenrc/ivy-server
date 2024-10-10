import { BadRequestException, Injectable } from "@nestjs/common";
import { FilterQuery, Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { CreateCollectionGroupPayload, PaginationResponse, UpdateCollectionGroupPayload } from "@app/models";
import { Collection, CollectionGroup } from "@app/schemas";
import { CategoryService } from "./category.service";
import { ErrorMessage } from "@app/enums";
import { NOT_DELETED_FILTER } from "@app/constants";

@Injectable()
export class CollectionGroupService {
  constructor(
    @InjectModel(CollectionGroup.name)
    private readonly collectionGroupModel: Model<CollectionGroup>,
    private readonly categoryService: CategoryService,
  ) { }

  async createCollectionGroup(payload: CreateCollectionGroupPayload): Promise<CollectionGroup> {
    const { categoryId, ...collection } = payload;

    const createdCollectionGroup: CollectionGroup = await this.collectionGroupModel.create({
      ...collection,
      collections: collection.collections.map((id) => new Types.ObjectId(id)),
    });

    this.categoryService.addGroup(categoryId, createdCollectionGroup);

    return createdCollectionGroup;
  }

  async updateCollectionGroup(updates: UpdateCollectionGroupPayload): Promise<CollectionGroup> {
    const { _id, ...group } = updates;

    if (!_id) {
      throw new BadRequestException(ErrorMessage.COLLECTION_GROUP_REQUIRED);
    }

    const updatedCollectionGroup: CollectionGroup = await this.collectionGroupModel.findByIdAndUpdate(
      _id,
      {
        ...group,
        collections: group.collections.map((id) => new Types.ObjectId(id)),
      },
      { new: true },
    );

    if (!updatedCollectionGroup) {
      throw new BadRequestException(ErrorMessage.COLLECTION_GROUP_NOT_FOUND);
    }

    return updatedCollectionGroup;
  }

  async deleteCollectionGroup(id: string): Promise<void> {
    const deletedGroup = await this.collectionGroupModel.findByIdAndUpdate(id, { isDeleted: true });

    if (!deletedGroup) throw new BadRequestException(ErrorMessage.COLLECTION_GROUP_NOT_FOUND);
  }

  async getCollectionGroups(page?: number, limit?: number): Promise<CollectionGroup[] | PaginationResponse<CollectionGroup>> {
    const baseQuery = this.collectionGroupModel
      .find(NOT_DELETED_FILTER)
      .populate({
        path: "collections",
        match: NOT_DELETED_FILTER,
      })
      .sort({ createdAt: -1 });

    if (page) {
      const limited = limit || 10;
      const skip = (page - 1) * limited;

      const [paginatedGroups, totalDocs] = await Promise.all([
        baseQuery.skip(skip).limit(limited).exec(),
        this.collectionGroupModel.countDocuments(NOT_DELETED_FILTER).exec(),
      ]);

      return {
        meta: {
          page: Number(page),
          limit: Number(limited),
          pages: Math.ceil(totalDocs / limited),
        },
        data: paginatedGroups,
      };
    }

    const groups = await baseQuery;

    return groups;
  }

  async getCollectionGroup(id: string): Promise<CollectionGroup> {
    const group: CollectionGroup = await this.collectionGroupModel.findById(id);

    if (!group) {
      throw new BadRequestException("CollectionGroup not found");
    }

    return group;
  }

  async addCollection(id: string, collection: Collection): Promise<CollectionGroup> {
    const updatedCollectionGroup: CollectionGroup = await this.collectionGroupModel.findByIdAndUpdate(id, {
      $push: {
        collections: new Types.ObjectId(collection._id),
      },
    });

    return updatedCollectionGroup;
  }

  async findCollectionGroup(
    query: FilterQuery<CollectionGroup>,
    populate: (keyof CollectionGroup)[] = [],
  ): Promise<CollectionGroup> {
    return await this.collectionGroupModel.findOne(query).populate(populate);
  }

  async findCollectionGroupById(id: string): Promise<CollectionGroup> {
    return await this.collectionGroupModel.findById(id);
  }

  async findCollectionGroups(
    query: FilterQuery<CollectionGroup>,
    populate: (keyof CollectionGroup)[] = [],
  ): Promise<CollectionGroup[]> {
    return await this.collectionGroupModel.find(query).populate(populate);
  }
}
