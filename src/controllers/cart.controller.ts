import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";

import { AddCartItemPayload } from "@app/models";
import { CartService } from "@app/services";
import { AuthUid } from "@app/decorators";
import { Cart } from "@app/schemas";
import { JWTAccessAuthGuard } from "@app/guards";

@Controller("cart")
@ApiTags("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post("/")
  @ApiBearerAuth()
  @ApiBody({ type: AddCartItemPayload })
  @ApiResponse({ type: Cart })
  async addCartItem(@Body() payload: AddCartItemPayload, @AuthUid() userId: string): Promise<Cart> {
    return await this.cartService.addCartItem(payload, userId);
  }

  @Get("/")
  @UseGuards(JWTAccessAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ type: Cart })
  async getUserCart(@AuthUid() userId: string): Promise<Cart> {
    return await this.cartService.getOrCreateCart(userId);
  }
}
