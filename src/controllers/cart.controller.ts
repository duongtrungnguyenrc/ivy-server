import { AddCartItemPayload, AddCartItemResponse } from "@app/models";
import { CartService } from "@app/services";
import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request } from "express";

@Controller("cart")
@ApiTags("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post("/")
  @ApiBody({ type: AddCartItemPayload })
  @ApiResponse({ type: AddCartItemResponse })
  addCartItem(@Body() payload: AddCartItemPayload, @Req() request: Request): Promise<AddCartItemResponse> {
    return this.cartService.addCartItem(payload, request);
  }
}
