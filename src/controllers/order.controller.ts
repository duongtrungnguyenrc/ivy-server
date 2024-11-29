import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { ApiBody, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

import {
  CancelOrderPayload,
  CreateOrderPayload,
  PaginationResponse,
  ProcessOrderPayload,
  UpdateOrderPayload,
} from "@app/models";
import { ApiPagination, Auth, AuthUid, IpAddress, Pagination } from "@app/decorators";
import { OrderService } from "@app/services";
import { OrderMessages } from "@app/enums";
import { Order } from "@app/schemas";
import { Types } from "mongoose";

@Controller("order")
@ApiTags("order")
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post("/")
  @ApiBody({ type: CreateOrderPayload })
  @ApiResponse({ description: OrderMessages.CREATE_ORDER_SUCCESS, type: Order })
  createOrder(@Body() payload: CreateOrderPayload, @AuthUid() userId: string): Promise<Order> {
    return this.orderService.createOrder(payload, userId);
  }

  @Post("/process/:id")
  @ApiBody({ type: ProcessOrderPayload })
  @ApiParam({ type: String, name: OrderMessages.ORDER_ID })
  @ApiResponse({ description: OrderMessages.CREATE_ORDER_SUCCESS, type: Order })
  async processOrder(
    @Body() payload: ProcessOrderPayload,
    @Param("id") orderId: string,
    @IpAddress() ipAddress: string,
  ): Promise<string> {
    return await this.orderService.processOrder(orderId, payload, ipAddress);
  }

  @Auth()
  @Post("/request-cancel/:id")
  @ApiParam({ type: String, name: OrderMessages.ORDER_ID })
  @ApiResponse({ description: OrderMessages.REQUEST_CANCEL_ORDER_SUCCESS })
  async requestCancelOrder(@Param("id") orderId: string, @AuthUid() userId: string): Promise<boolean> {
    return await this.orderService.requestCancelOrder(orderId, userId);
  }

  @Auth(["ADMIN"])
  @Post("/cancel/:id")
  @ApiParam({ type: String, name: OrderMessages.ORDER_ID })
  @ApiBody({ type: CancelOrderPayload })
  @ApiResponse({ description: OrderMessages.CANCEL_ORDER_SUCCESS })
  async cancelOrder(
    @Param("id") orderId: string,
    @Body() payload: CancelOrderPayload,
    @IpAddress() ipAddress: string,
  ): Promise<void> {
    return await this.orderService.cancelOrder(orderId, payload, ipAddress);
  }

  @Put("/:id")
  @ApiBody({ type: UpdateOrderPayload })
  @ApiParam({ type: String, name: "id", description: OrderMessages.ORDER_ID })
  @ApiResponse({ description: OrderMessages.UPDATE_ORDER_SUCCESS, type: Order })
  updateOrder(@Body() payload: UpdateOrderPayload, @Param("id") id: string): Promise<Order> {
    return this.orderService.updateOrder(id, payload);
  }

  @Get("/")
  @ApiPagination()
  @Auth()
  @ApiResponse({ type: Array<Order>, description: OrderMessages.USER_ORDERS })
  async getCustomerdOrders(
    @AuthUid() userId: string,
    @Pagination() pagination: Pagination,
  ): Promise<PaginationResponse<Order>> {
    return await this.orderService.findMultiplePaging({ user: new Types.ObjectId(userId) }, pagination);
  }

  @Get("/admin/")
  @ApiPagination()
  @Auth(["ADMIN"])
  @ApiResponse({ type: Array<Order>, description: OrderMessages.USER_ORDERS })
  async getAdminOrders(@Pagination() pagination: Pagination): Promise<PaginationResponse<Order>> {
    return await this.orderService.findMultiplePaging({}, pagination, undefined, ["user", "transaction"]);
  }

  @Get("/detail/:id")
  @ApiParam({ type: String, name: OrderMessages.ORDER_ID })
  async getOrderDetail(@Param("id") orderId: string) {
    return await this.orderService.getOrderDetail(orderId);
  }
}
