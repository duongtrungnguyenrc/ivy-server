import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";

import { CategoryService } from "@app/services";
import { Category } from "@app/schemas";
import { CreateCategoryPayload } from "@app/models";
import { JWTAccessAuthGuard } from "@app/guards";
import { HasRole } from "@app/decorators";

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
    console.log("upload");

    return this.categoryService.createCategory(payload);
  }
}
