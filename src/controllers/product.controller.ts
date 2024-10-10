import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CreateProductPayload, PaginationResponse, UpdateProductPayload } from "@app/models";
import { ApiPagination, Auth, Pagination } from "@app/decorators";
import { ProductService } from "@app/services";
import { ProductMessages } from "@app/enums";
import { Product } from "@app/schemas";

@Controller("product")
@ApiTags("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get("/all")
  @ApiPagination()
  @ApiResponse({ description: ProductMessages.GET_PRODUCT_SUCCESS, type: PaginationResponse<Product> })
  getAllProducts(@Pagination() pagination: Pagination): Promise<PaginationResponse<Product>> {
    return this.productService.getAllProduct(pagination);
  }

  @Get("/:id")
  @ApiParam({ type: String, name: "id", description: ProductMessages.PRODUCT_ID })
  @ApiResponse({ type: Product })
  getProduct(@Param("id") id: string): Promise<Product> {
    return this.productService.getProduct(id);
  }

  @Get("/")
  @ApiPagination()
  @ApiResponse({ description: ProductMessages.GET_PRODUCT_SUCCESS, type: PaginationResponse<Product> })
  getProductsByCollection(
    @Query("collection") collectionId: string,
    @Pagination() pagination: Pagination,
  ): Promise<PaginationResponse<Product>> {
    return this.productService.getProductsByCollection(collectionId, pagination);
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
  updateProduct(@Param("id") id: string, @Body() payload: UpdateProductPayload): Promise<Product> {
    return this.productService.updateProduct(id, payload);
  }

  @Delete("/:id")
  @Auth(["ADMIN"])
  @ApiParam({ type: String, name: "id", description: ProductMessages.PRODUCT_ID })
  @ApiResponse({ description: ProductMessages.DELETE_PRODUCT_SUCCESS })
  deleteProduct(@Param("id") id: string): Promise<void> {
    return this.productService.deleteProduct(id);
  }
}
