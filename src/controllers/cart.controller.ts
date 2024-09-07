import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Post, Req } from "@nestjs/common";
import { Request } from "express";

import { AddCartItemPayload } from "@app/models";
import { CartService } from "@app/services";
import { Cart } from "@app/schemas";

@Controller("cart")
@ApiTags("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post("/")
  @ApiBearerAuth()
  @ApiBody({ type: AddCartItemPayload })
  @ApiResponse({ type: Cart })
  addCartItem(@Body() payload: AddCartItemPayload, @Req() request: Request): Promise<Cart> {
    return this.cartService.addCartItem(payload, request);
  }
}
