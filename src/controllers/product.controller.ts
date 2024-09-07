import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";

import {
  CreateProductPayload,
  CreateProductResponse,
  DeleteProductResponse,
  GetProductsByCollectionResponse,
  UpdateProductPayload,
  UpdateProductResponse,
} from "@app/models";
import { JWTAccessAuthGuard } from "@app/guards";
import { ProductService } from "@app/services";
import { HasRole } from "@app/decorators";

@Controller("product")
@ApiTags("product")
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  getNewProducts() {}

  getBestSellerProducts() {}

  @Get("/:id")
  getProductDetail() {}

  @Get("/collection/:id")
  getProductsByCollection(
    @Param("id") id: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
  ): Promise<GetProductsByCollectionResponse> {
    return this.productService.getProductsByCollection(id, page, limit);
  }

  @Post("/")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBearerAuth()
  @ApiBody({ type: CreateProductPayload })
  @ApiResponse({ type: CreateProductResponse })
  createProduct(@Body() payload: CreateProductPayload): Promise<CreateProductResponse> {
    return this.productService.createProduct(payload);
  }

  @Put("/:id")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBearerAuth()
  @ApiParam({ type: String, name: "id" })
  @ApiBody({ type: UpdateProductPayload })
  @ApiResponse({ type: UpdateProductResponse })
  updateProduct(@Param("id") id: string, @Body() payload: UpdateProductPayload): Promise<UpdateProductResponse> {
    return this.productService.updateProduct(id, payload);
  }

  @Delete("/:id")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBearerAuth()
  @ApiParam({ type: String, name: "id" })
  @ApiResponse({ type: DeleteProductResponse })
  deleteProduct(@Param("id") id: string): Promise<DeleteProductResponse> {
    return this.productService.deleteProduct(id);
  }
}
