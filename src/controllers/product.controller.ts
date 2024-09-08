import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";

import { CreateProductPayload, GetProductsByCollectionResponse, UpdateProductPayload } from "@app/models";
import { JWTAccessAuthGuard } from "@app/guards";
import { ProductService } from "@app/services";
import { HasRole } from "@app/decorators";
import { Product } from "@app/schemas";

@Controller("product")
@ApiTags("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  getNewProducts() {}

  getBestSellerProducts() {}

  @Get("/:id")
  @ApiResponse({ type: Product })
  getProduct(@Param("id") id: string): Promise<Product> {
    return this.productService.getProduct(id);
  }

  @Get("/")
  getProductsByCollection(
    @Query("collection") collectionId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ): Promise<GetProductsByCollectionResponse> {
    return this.productService.getProductsByCollection(collectionId, page, limit);
  }

  @Post("/")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBearerAuth()
  @ApiBody({ type: CreateProductPayload })
  @ApiResponse({ type: Product })
  createProduct(@Body() payload: CreateProductPayload): Promise<Product> {
    return this.productService.createProduct(payload);
  }

  @Put("/:id")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBearerAuth()
  @ApiParam({ type: String, name: "id" })
  @ApiBody({ type: UpdateProductPayload })
  @ApiResponse({ type: Product })
  updateProduct(@Param("id") id: string, @Body() payload: UpdateProductPayload): Promise<Product> {
    return this.productService.updateProduct(id, payload);
  }

  @Delete("/:id")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBearerAuth()
  @ApiParam({ type: String, name: "id" })
  deleteProduct(@Param("id") id: string): Promise<void> {
    return this.productService.deleteProduct(id);
  }
}
