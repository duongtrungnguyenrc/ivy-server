import { GetCategoriesResponse } from "@app/models";
import { CategoryService } from "@app/services";
import { Controller, Get } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller("category")
@ApiTags("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get("/")
  @ApiResponse({
    type: GetCategoriesResponse,
  })
  getCategories(): Promise<GetCategoriesResponse> {
    return this.categoryService.getCategories();
  }
}
