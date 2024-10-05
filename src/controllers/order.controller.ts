import { Body, Controller, Get, Param, Post, Put, Query, Req, Res } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";

import { CreateOrderPayload, UpdateOrderPayload } from "@app/models";
import { AuthUid, IpAddress } from "@app/decorators";
import { OrderService } from "@app/services";
import { Order } from "@app/schemas";

@Controller("order")
@ApiTags("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post("/")
  @ApiBody({ type: CreateOrderPayload })
  @ApiResponse({ type: Order })
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
  updateOrder(@Body() payload: UpdateOrderPayload, @Param("id") id: string): Promise<Order> {
    return this.orderService.updateOrder(id, payload);
  }

  @Post("/delivery-callback")
  deliveryCallback() {}

  @Get("/payment-callback")
  paymentCallback(@Req() request: Request, @Res() response: Response): Promise<void> {
    return this.orderService.paymentCallback(request, response);
  }
  @Get("revenue")
  async getRevenue(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    console.log("checkign revenue");
    return this.orderService.calculateRevenue(start, end);
  }
  @Get("profit")
  async getProfit(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    console.log("checking");
    return await this.orderService.calculateProfit(start, end);
  }
}
