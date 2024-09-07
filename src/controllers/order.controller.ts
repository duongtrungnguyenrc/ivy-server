import { Body, Controller, Get, Param, Post, Put, Req, Res } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";

import { CreateOrderPayload, UpdateOrderPayload } from "@app/models";
import { OrderService } from "@app/services";
import { Order } from "@app/schemas";

@Controller("order")
@ApiTags("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post("/")
  @ApiBody({ type: CreateOrderPayload })
  @ApiResponse({ type: Order })
  createOrder(@Body() payload: CreateOrderPayload, @Req() request: Request, @Res() response: Response): Promise<Order> {
    return this.orderService.createOrder(payload, request, response);
  }

  @Put("/:id")
  @ApiBody({ type: UpdateOrderPayload })
  updateOrder(@Body() payload: UpdateOrderPayload, @Param("id") id: string): Promise<Order> {
    return this.orderService.updateOrder(id, payload);
  }

  @Post("/delivery-callback")
  deliveryCallback() {}

  @Get("/payment-callback")
  paymentCallback(@Req() request: Request, @Res() response: Response): Promise<void> {
    return this.orderService.paymentCallback(request, response);
  }
}
