import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateProductPayload, GetProductsByCollectionResponse, UpdateProductPayload } from "@app/models";
import { Auth, Pagination } from "@app/decorators";
import { ProductService } from "@app/services";
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
    @Pagination() pagination: Pagination,
  ): Promise<GetProductsByCollectionResponse> {
    return this.productService.getProductsByCollection(collectionId, pagination);
  }

  @Post("/")
  @Auth(["ADMIN"])
  @ApiBody({ type: CreateProductPayload })
  @ApiResponse({ type: Product })
  async createProduct(@Body() payload: CreateProductPayload): Promise<Product> {
    return await this.productService.createProduct(payload);
  }

  @Put("/:id")
  @Auth(["ADMIN"])
  @ApiParam({ type: String, name: "id" })
  @ApiBody({ type: UpdateProductPayload })
  @ApiResponse({ type: Product })
  updateProduct(@Param("id") id: string, @Body() payload: UpdateProductPayload): Promise<Product> {
    return this.productService.updateProduct(id, payload);
  }

  @Delete("/:id")
  @Auth(["ADMIN"])
  @ApiParam({ type: String, name: "id" })
  deleteProduct(@Param("id") id: string): Promise<void> {
    return this.productService.deleteProduct(id);
  }
}
