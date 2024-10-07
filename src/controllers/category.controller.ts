import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateCategoryPayload } from "@app/models";
import { CategoryService } from "@app/services";
import { Category } from "@app/schemas";
import { Auth } from "@app/decorators";

@Controller("category")
@ApiTags("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get("/")
  @ApiResponse({
    type: [Category],
  })
  getCategories(): Promise<Category[]> {
    return this.categoryService.getCategories();
  }

  @Post("/")
  @Auth(["ADMIN"])
  @ApiBody({ type: CreateCategoryPayload })
  @ApiResponse({ type: Category })
  createCategory(@Body() payload: CreateCategoryPayload): Promise<Category> {
    return this.categoryService.createCategory(payload);
  }
}
