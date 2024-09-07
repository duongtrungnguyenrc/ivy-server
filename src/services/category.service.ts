import { Injectable } from "@nestjs/common";

import { GroupService } from "./group.service";
import { GetCategoriesResponse } from "@app/models";
import { ProductCategory } from "@app/enums";
import { Group } from "@app/schemas";

@Injectable()
export class CategoryService {
  constructor(private readonly groupService: GroupService) {}

  async getCategories(): Promise<GetCategoriesResponse[]> {
    const categories = await Promise.all(
      Object.values(ProductCategory).map(async (category) => {
        const groups: Group[] = await this.groupService.findGroups({ category }, ["collections"]);

        return {
          name: category,
          groups: groups,
        };
      }),
    );

    return categories;
  }
}
