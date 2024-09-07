import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { FilterQuery, Model } from "mongoose";

import { CreateGroupPayload } from "@app/models";
import { Group } from "@app/schemas";

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name)
    private readonly GroupModel: Model<Group>,
  ) {}

  async createGroup(payload: CreateGroupPayload): Promise<Group> {
    const createdGroup: Group = await this.GroupModel.create({
      ...payload,
    });

    return createdGroup;
  }

  async updateGroup(updates: Partial<Group>): Promise<Group> {
    const { _id, collections } = updates;

    if (!_id) {
      throw new BadRequestException("Group id is required");
    }

    const updatedGroup: Group = await this.GroupModel.findByIdAndUpdate(
      _id,
      {
        $push: { collections: { $each: collections.map(({ _id }) => new mongoose.Types.ObjectId(_id)) } },
      },
      { new: true },
    );

    if (!updatedGroup) {
      throw new BadRequestException("Group not found");
    }

    return updatedGroup;
  }

  async getGroups(): Promise<Group[]> {
    const groups: Group[] = await this.GroupModel.find().populate("collections");

    return groups;
  }

  async getGroup(id: string): Promise<Group> {
    const group: Group = await this.GroupModel.findById(id);

    if (!group) {
      throw new BadRequestException("Group not found");
    }

    return group;
  }

  async findGroup(query: FilterQuery<Group>, populate: (keyof Group)[] = []): Promise<Group> {
    return await this.GroupModel.findOne(query).populate(populate);
  }

  async findGroupById(id: string): Promise<Group> {
    return await this.GroupModel.findById(id);
  }

  async findGroups(query: FilterQuery<Group>, populate: (keyof Group)[] = []): Promise<Group[]> {
    return await this.GroupModel.find(query).populate(populate);
  }
}
