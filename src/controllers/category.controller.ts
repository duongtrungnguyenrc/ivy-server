import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateCategoryPayload, PaginationResponse } from "@app/models";
import { ApiPagination, Auth, Pagination } from "@app/decorators";
import { CategoryService } from "@app/services";
import { CategoryMessages } from "@app/enums";
import { Category } from "@app/schemas";

@Controller("category")
@ApiTags("category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get("/all")
  @ApiResponse({ description: CategoryMessages.GET_CATEGORIES_SUCCESS, type: [Category] })
  async getCategories(): Promise<Array<Category>> {
    return await this.categoryService.getCategories();
  }

  @Get("/")
  @ApiPagination()
  @ApiResponse({ description: CategoryMessages.GET_CATEGORIES_SUCCESS, type: [PaginationResponse<Category>] })
  async getPagingCategories(@Pagination() pagination: Pagination): Promise<PaginationResponse<Category>> {
    return await this.categoryService.findMultiplePaging({}, pagination);
  }

  @Put("/:id")
  @Auth(["ADMIN"])
  @ApiBody({ type: CreateCategoryPayload })
  @ApiResponse({ type: Category, description: CategoryMessages.UPDATE_CATEGORIES_SUCCESS })
  @ApiParam({ type: String, name: "id" })
  async updateCategory(@Param("id") id: string, @Body() payload: CreateCategoryPayload): Promise<Category> {
    return await this.categoryService.update(id, payload);
  }

  @Delete("/:id")
  @Auth(["ADMIN"])
  @ApiParam({ type: String, name: "id" })
  @ApiResponse({ description: CategoryMessages.DELETE_CATEGORIES_SUCCESS })
  async deleteCategory(@Param("id") id: string): Promise<boolean> {
    return await this.categoryService.safeDelete(id);
  }

  @Post("/")
  @Auth(["ADMIN"])
  @ApiBody({ type: CreateCategoryPayload })
  @ApiResponse({ description: CategoryMessages.CREATE_CATEGORY_SUCCESS, type: Category })
  async createCategory(@Body() payload: CreateCategoryPayload): Promise<Category> {
    return await this.categoryService.create(payload);
  }
}
