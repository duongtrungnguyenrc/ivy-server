import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateCategoryPayload, PaginationResponse } from "@app/models";
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
  getCategories(
    @Query("page") page: number,
    @Query("limit") limit: number,
  ): Promise<Category[] | PaginationResponse<Category>> {
    return this.categoryService.getCategories(page, limit);
  }

  @Put("/:id")
  @Auth(["ADMIN"])
  @ApiBody({ type: CreateCategoryPayload })
  @ApiResponse({ type: Category, description: CategoryMessages.UPDATE_CATEGORIES_SUCCESS })
  @ApiParam({ type: String, name: "id" })
  updateCategory(@Param("id") id: string, @Body() payload: CreateCategoryPayload): Promise<Category> {
    return this.categoryService.updateCategory(id, payload);
  }

  @Delete("/:id")
  @Auth(["ADMIN"])
  @ApiParam({ type: String, name: "id" })
  @ApiResponse({ description: CategoryMessages.DELETE_CATEGORIES_SUCCESS })
  deleteCategory(@Param("id") id: string): Promise<void> {
    return this.categoryService.deleteCategory(id);
  }

  @Post("/")
  @Auth(["ADMIN"])
  @ApiBody({ type: CreateCategoryPayload })
  @ApiResponse({ description: CategoryMessages.CREATE_CATEGORY_SUCCESS, type: Category })
  createCategory(@Body() payload: CreateCategoryPayload): Promise<Category> {
    return this.categoryService.createCategory(payload);
  }
}
