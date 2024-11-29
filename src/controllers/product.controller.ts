import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateProductPayload, PaginationResponse, TopProductsResponse, UpdateProductPayload } from "@app/models";
import { ApiPagination, Auth, Pagination } from "@app/decorators";
import { ProductService } from "@app/services";
import { ProductMessages } from "@app/enums";
import { Product } from "@app/schemas";
import { NOT_DELETED_FILTER } from "@app/constants";

@Controller("product")
@ApiTags("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get("/all")
  @ApiPagination()
  @ApiResponse({ description: ProductMessages.GET_PRODUCT_SUCCESS, type: PaginationResponse<Product> })
  async getAllProducts(@Pagination() pagination: Pagination): Promise<PaginationResponse<Product>> {
    return await this.productService.findMultiplePaging(
      NOT_DELETED_FILTER,
      pagination,
      ["-costs"],
      ["currentCost", "options"],
    );
  }

  @Get("/top")
  @ApiResponse({ description: ProductMessages.GET_PRODUCT_SUCCESS, type: [TopProductsResponse] })
  async getBestSellerProducts() {
    return await this.productService.getTopProductsByCategory();
  }

  @Get("/:id")
  @ApiParam({ type: String, name: "id", description: ProductMessages.PRODUCT_ID })
  @ApiResponse({ type: Product })
  async getProduct(@Param("id") id: string): Promise<Product> {
    return await this.productService.getProductDetail(id);
  }

  @Get("/")
  @ApiPagination()
  @ApiResponse({ description: ProductMessages.GET_PRODUCT_SUCCESS, type: PaginationResponse<Product> })
  async getProductsByCollection(
    @Query("collection") collectionId: string,
    @Pagination() pagination: Pagination,
  ): Promise<PaginationResponse<Product>> {
    return await this.productService.getProductsByCollection(collectionId, pagination);
  }

  @Post("/")
  @Auth(["ADMIN"])
  @ApiBody({ type: CreateProductPayload })
  @ApiResponse({ description: ProductMessages.CREATE_PRODUCT_SUCCESS, type: Product })
  async createProduct(@Body() payload: CreateProductPayload): Promise<Product> {
    return await this.productService.createProduct(payload);
  }

  @Put("/:id")
  @Auth(["ADMIN"])
  @ApiParam({ type: String, name: "id", description: ProductMessages.PRODUCT_ID })
  @ApiBody({ type: UpdateProductPayload })
  @ApiResponse({ description: ProductMessages.UPDATE_PRODUCT_SUCCESS, type: Product })
  async updateProduct(@Param("id") id: string, @Body() payload: UpdateProductPayload): Promise<Product> {
    return await this.productService.updateProduct(id, payload);
  }

  @Delete("/:id")
  @Auth(["ADMIN"])
  @ApiParam({ type: String, name: "id", description: ProductMessages.PRODUCT_ID })
  @ApiResponse({ description: ProductMessages.DELETE_PRODUCT_SUCCESS })
  deleteProduct(@Param("id") id: string): Promise<void> {
    return this.productService.safeDeleteProduct(id);
  }
}
