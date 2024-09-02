import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Delete, Post, Put, UseGuards } from "@nestjs/common";

import {
  CreateProductPayload,
  CreateProductResponse,
  DeleteProductPayload,
  DeleteProductResponse,
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

  getProductDetail() {}

  getProductsByCategory() {}

  @Post("/")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBody({ type: CreateProductPayload })
  @ApiResponse({ type: CreateProductResponse })
  createProduct(@Body() payload: CreateProductPayload): Promise<CreateProductResponse> {
    return this.productService.createProduct(payload);
  }

  @Put("/")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBody({ type: UpdateProductPayload })
  @ApiResponse({ type: UpdateProductResponse })
  updateProduct(@Body() payload: UpdateProductPayload): Promise<UpdateProductResponse> {
    return this.productService.updateProduct(payload);
  }

  @Delete("/")
  @UseGuards(JWTAccessAuthGuard)
  @HasRole("ADMIN")
  @ApiBody({ type: DeleteProductPayload })
  @ApiResponse({ type: DeleteProductResponse })
  deleteProduct(@Body() payload: DeleteProductPayload): Promise<DeleteProductResponse> {
    return this.productService.deleteProduct(payload);
  }
}
