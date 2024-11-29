import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Delete, Param, Post } from "@nestjs/common";

import { AddCartItemPayload, getCartItemPayload } from "@app/models";
import { AuthUid } from "@app/decorators";
import { CartService } from "@app/services";
import { CartItem } from "@app/schemas";
import { CartMessages } from "@app/enums";

@Controller("cart")
@ApiTags("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post("/items/add")
  @ApiBody({ type: AddCartItemPayload })
  @ApiResponse({ description: CartMessages.ADD_CART_ITEM_SUCCESS, type: CartItem })
  async addCartItem(@Body() payload: AddCartItemPayload, @AuthUid() userId: string): Promise<CartItem> {
    return await this.cartService.addCartItem(payload, userId);
  }

  @Post("/items")
  async getCartItems(@Body() payload: getCartItemPayload, @AuthUid() userId: string) {
    return this.cartService.getCartItems(payload, userId);
  }

  @Delete("/items/:id")
  async deleteCartItem(@Param("id") id: string) {
    return this.cartService.delete(id);
  }
}
