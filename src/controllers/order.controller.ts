import { Body, Controller, Get, Param, Post, Put, Req, Res } from "@nestjs/common";
import { ApiBody, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";

import { CreateOrderPayload, UpdateOrderPayload } from "@app/models";
import { AuthUid, IpAddress } from "@app/decorators";
import { OrderService } from "@app/services";
import { OrderMessages } from "@app/enums";
import { Order } from "@app/schemas";

@Controller("order")
@ApiTags("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post("/")
  @ApiBody({ type: CreateOrderPayload })
  @ApiResponse({ description: OrderMessages.CREATE_ORDER_SUCCESS, type: Order })
  createOrder(
    @Body() payload: CreateOrderPayload,
    @AuthUid() userId: string,
    @IpAddress() ipAddress: string,
    @Res() response: Response,
  ): Promise<Order> {
    return this.orderService.createOrder(payload, userId, ipAddress, response);
  }

  @Put("/:id")
  @ApiBody({ type: UpdateOrderPayload })
  @ApiParam({ type: String, name: "id", description: OrderMessages.ORDER_ID })
  @ApiResponse({ description: OrderMessages.UPDATE_ORDER_SUCCESS, type: Order })
  updateOrder(@Body() payload: UpdateOrderPayload, @Param("id") id: string): Promise<Order> {
    return this.orderService.updateOrder(id, payload);
  }

  @Post("/delivery-callback")
  deliveryCallback() {}

  @Get("/payment-callback")
  @ApiResponse({ description: OrderMessages.PAYMENT_CALLBACK_SUCCESS })
  paymentCallback(@Req() request: Request, @Res() response: Response): Promise<void> {
    return this.orderService.paymentCallback(request, response);
  }
}
