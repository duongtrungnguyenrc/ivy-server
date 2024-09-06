import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";

import {
  CreateGroupPayload,
  CreateGroupResponse,
  GetGroupResponse,
  GetGroupsResponse,
  UpdateGroupResponse,
} from "@app/models";
import { Group } from "@app/schemas";

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name)
    private readonly GroupModel: Model<Group>,
  ) {}

  async createGroup(payload: CreateGroupPayload): Promise<CreateGroupResponse> {
    const createdGroup: Group = await this.GroupModel.create({
      ...payload,
    });

    const response: CreateGroupResponse = {
      data: createdGroup,
      message: "Create group success",
    };

    return response;
  }

  async updateGroup(updates: Partial<Group>, raw: boolean = false): Promise<Group | UpdateGroupResponse> {
    const { _id, collections } = updates;

    if (!_id) {
      throw new BadRequestException("Group id is required");
    }

    const updatedGroup: Group = await this.GroupModel.findOneAndUpdate(
      { _id },
      {
        $push: { collections: { $each: collections } },
      },
      { new: true },
    );

    if (!updatedGroup) {
      throw new BadRequestException("Group not found");
    }

    if (raw) {
      return updatedGroup;
    }

    const response: UpdateGroupResponse = {
      data: updatedGroup,
      message: "Update group success",
    };

    return response;
  }

  async getGroups(): Promise<GetGroupsResponse> {
    const Groups: Group[] = await this.GroupModel.find().populate("collections");

    const response: GetGroupsResponse = {
      data: Groups,
      message: "Get groups success",
    };

    return response;
  }

  async getGroup(id: string): Promise<GetGroupResponse> {
    const group: Group = await this.GroupModel.findById(id);

    if (!group) {
      throw new BadRequestException("Group not found");
    }

    const response: GetGroupResponse = {
      data: group,
      message: "Get groups success",
    };

    return response;
  }

  async findGroupById(id: string): Promise<Group> {
    return await this.GroupModel.findById(id);
  }

  async findGroups(query: FilterQuery<Group>): Promise<Group[]> {
    return await this.GroupModel.find(query);
  }
}
