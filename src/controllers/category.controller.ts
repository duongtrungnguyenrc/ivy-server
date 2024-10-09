import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateCategoryPayload } from "@app/models";
import { CategoryService } from "@app/services";
import { Category } from "@app/schemas";
import { Auth } from "@app/decorators";
import { CategoryMessages } from "@app/enums";

@Controller("category")
@ApiTags("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get("/")
  @ApiResponse({ description: CategoryMessages.GET_CATEGORIES_SUCCESS, type: [Category] })
  getCategories(): Promise<Category[]> {
    return this.categoryService.getCategories();
  }

  @Post("/")
  @Auth(["ADMIN"])
  @ApiBody({ type: CreateCategoryPayload })
  @ApiResponse({ description: CategoryMessages.CREATE_CATEGORY_SUCCESS, type: Category })
  createCategory(@Body() payload: CreateCategoryPayload): Promise<Category> {
    return this.categoryService.createCategory(payload);
  }
}
