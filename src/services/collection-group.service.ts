import { BadRequestException, Injectable } from "@nestjs/common";
import { FilterQuery, Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { CreateCollectionGroupPayload } from "@app/models";
import { Collection, CollectionGroup } from "@app/schemas";
import { CategoryService } from "./category.service";

@Injectable()
export class CollectionGroupService {
  constructor(
    @InjectModel(CollectionGroup.name)
    private readonly collectionGroupModel: Model<CollectionGroup>,
    private readonly categoryService: CategoryService,
  ) {}

  async createCollectionGroup(payload: CreateCollectionGroupPayload): Promise<CollectionGroup> {
    const { categoryId, ...collection } = payload;

    const createdCollectionGroup: CollectionGroup = await this.collectionGroupModel.create({
      ...collection,
    });

    this.categoryService.addGroup(categoryId, createdCollectionGroup);

    return createdCollectionGroup;
  }

  async updateCollectionGroup(updates: Partial<CollectionGroup>): Promise<CollectionGroup> {
    const { _id, collections } = updates;

    if (!_id) {
      throw new BadRequestException("CollectionGroup id is required");
    }

    const updatedCollectionGroup: CollectionGroup = await this.collectionGroupModel.findByIdAndUpdate(
      _id,
      {
        $push: { collections: { $each: collections.map(({ _id }) => new Types.ObjectId(_id)) } },
      },
      { new: true },
    );

    if (!updatedCollectionGroup) {
      throw new BadRequestException("CollectionGroup not found");
    }

    return updatedCollectionGroup;
  }

  async getCollectionGroups(): Promise<CollectionGroup[]> {
    const groups: CollectionGroup[] = await this.collectionGroupModel.find().populate("collections");

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
