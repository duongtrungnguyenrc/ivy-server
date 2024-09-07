import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Body, Controller, Post, Req } from "@nestjs/common";
import { Request } from "express";

import { AddCartItemPayload, AddCartItemResponse } from "@app/models";
import { CartService } from "@app/services";

@Controller("cart")
@ApiTags("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post("/")
  @ApiBearerAuth()
  @ApiBody({ type: AddCartItemPayload })
  @ApiResponse({ type: AddCartItemResponse })
  addCartItem(@Body() payload: AddCartItemPayload, @Req() request: Request): Promise<AddCartItemResponse> {
    return this.cartService.addCartItem(payload, request);
  }
}
