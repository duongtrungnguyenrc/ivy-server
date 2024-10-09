import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Get, Post } from "@nestjs/common";

import { AddCartItemPayload } from "@app/models";
import { Auth, AuthUid } from "@app/decorators";
import { CartService } from "@app/services";
import { Cart } from "@app/schemas";
import { CartMessages } from "@app/enums";

@Controller("cart")
@ApiTags("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post("/")
  @ApiBody({ type: AddCartItemPayload })
  @ApiResponse({ description: CartMessages.ADD_CART_ITEM_SUCCESS, type: Cart })
  async addCartItem(@Body() payload: AddCartItemPayload, @AuthUid() userId: string): Promise<Cart> {
    return await this.cartService.addCartItem(payload, userId);
  }

  @Get("/")
  @Auth()
  @ApiResponse({ description: CartMessages.GET_USER_CART_SUCCESS, type: Cart })
  async getUserCart(@AuthUid() userId: string): Promise<Cart> {
    return await this.cartService.getOrCreateCart(userId);
  }
}
