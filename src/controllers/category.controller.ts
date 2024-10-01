import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateCategoryPayload } from "@app/models";
import { JWTAccessAuthGuard } from "@app/guards";
import { CategoryService } from "@app/services";
import { HasRole } from "@app/decorators";
import { Category } from "@app/schemas";

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
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBody({ type: CreateCategoryPayload })
  @ApiResponse({ type: Category })
  createCategory(@Body() payload: CreateCategoryPayload): Promise<Category> {
    return this.categoryService.createCategory(payload);
  }
}
