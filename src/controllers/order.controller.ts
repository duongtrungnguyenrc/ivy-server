import { Body, Controller, Get, Param, Post, Put, Req, Res } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";

import { CreateOrderResponse, CreateOrderPayload, UpdateOrderPayload, UpdateOrderResponse } from "@app/models";
import { OrderService } from "@app/services";

@Controller("order")
@ApiTags("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post("/")
  @ApiBody({ type: CreateOrderPayload })
  @ApiResponse({ type: CreateOrderResponse })
  createOrder(
    @Body() payload: CreateOrderPayload,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<CreateOrderResponse> {
    return this.orderService.createOrder(payload, request, response);
  }

  @Put("/:id")
  @ApiBody({ type: UpdateOrderPayload })
  @ApiResponse({ type: UpdateOrderResponse })
  updateOrder(@Body() payload: UpdateOrderPayload, @Param("id") id: string) {
    return this.orderService.updateOrder(id, payload);
  }

  @Post("/delivery-callback")
  deliveryCallback() {}

  @Get("/payment-callback")
  paymentCallback(@Req() request: Request, @Res() response: Response) {
    return this.orderService.paymentCallback(request, response);
  }
}
