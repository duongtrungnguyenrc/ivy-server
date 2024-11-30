import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { ClientSession, Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from "@nestjs/common";

import { CancelOrderPayload, CreateOrderPayload, PaginationResponse, ProcessOrderPayload } from "@app/models";
import { CartItem, Option, Order, OrderItem, OrderTransaction } from "@app/schemas";
import { ErrorMessage, MailSubject, OrderStatus, PaymentMethod, TransactionStatus } from "@app/enums";
import { ORDER_CACHE_PREFIX, VNPAY_FASHION_PRODUCT_TYPE } from "@app/constants";
import { RepositoryService } from "@app/services/repository.service";
import { DeliveryService } from "@app/services/delivery.service";
import { PaymentService } from "@app/services/payment.service";
import { withMutateTransaction } from "@app/utils";
import { CacheService } from "./cache.service";
import { CartService } from "./cart.service";
import { UserService } from "./user.service";

@Injectable()
export class OrderService extends RepositoryService<Order> {
  constructor(
    @InjectModel(OrderTransaction.name) private readonly orderTransactionModel: Model<OrderTransaction>,
    @InjectModel(OrderItem.name) private readonly orderItemModel: Model<OrderItem>,
    @InjectModel(Option.name) private readonly optionModel: Model<Option>,
    private readonly deliveryService: DeliveryService,
    private readonly paymentService: PaymentService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly cartService: CartService,
    cacheService: CacheService,
    @InjectModel(Order.name)
    orderModel: Model<Order>,
  ) {
    super(orderModel, cacheService, ORDER_CACHE_PREFIX);
  }

  async getCustomerOrders(userId: string, pagination: Pagination): Promise<PaginationResponse<Order>> {
    const user = await this.userService.find(userId, ["email"]);

    if (!user) {
      throw new BadRequestException(ErrorMessage.CUSTOMER_NOT_FOUND);
    }

    return await this.findMultiplePaging(
      {
        email: user.email,
      },
      pagination,
    );
  }

  async getOrderDetail(id: string): Promise<Order> {
    const order = await this.find(
      id,
      undefined,
      [
        {
          path: "items",
          populate: [
            {
              path: "cost",
              model: "Cost",
            },
            {
              path: "product",
              model: "Product",
              select: ["_id", "name", "images"],
            },
            {
              path: "option",
              model: "Option",
            },
          ],
        },
        "transaction",
      ],
      false,
      `detail`,
    );

    if (!order) throw new BadRequestException(ErrorMessage.ORDER_NOT_FOUND);
    return order;
  }

  async createOrder(payload: CreateOrderPayload, userId: string): Promise<Order> {
    return withMutateTransaction<Order>(this._model, async (session) => {
      const createdItems = await Promise.all(payload.items.map((item) => this.createOrderItem(item, session)));

      const { totalCost, discountCost } = this.calculateTotalCost(createdItems);

      return this._model.create({
        ...payload,
        items: createdItems.map(({ _id }) => new Types.ObjectId(_id)),
        user: new Types.ObjectId(userId),
        totalCost: totalCost,
        discountCost: discountCost,
      });
    });
  }

  async processOrder(orderId: string, payload: ProcessOrderPayload, ipAddress: string): Promise<string> {
    return withMutateTransaction<Order, string>(this._model, async (session) => {
      const { addressCode, ...updates } = payload;
      const [wardCode, districtId] = payload.addressCode;

      const existedOrder = await this._model
        .findById(orderId)
        .select(["_id", "totalCost", "items", "discountCost"])
        .populate({
          path: "items",
          populate: {
            path: "product",
            model: "Product",
            select: "name",
          },
          select: ["quantity", "product"],
        })
        .session(session);

      if (!existedOrder) {
        throw new BadRequestException(ErrorMessage.ORDER_NOT_FOUND);
      }

      const shippingCost: number = await this.deliveryService.calcFee(
        existedOrder.totalCost,
        parseInt(districtId),
        wardCode,
        existedOrder.items.map(({ quantity, product }) => ({
          quantity,
          name: product.name,
          ...this.deliveryService.getPackageItemInfo(quantity),
        })),
      );

      const transactionAmount = existedOrder.totalCost + shippingCost - existedOrder.discountCost;
      const orderTransaction: OrderTransaction = await this.createPendingTransaction(transactionAmount, session);

      const order = await this.update(
        { _id: orderId },
        {
          ...updates,
          addressCode,
          shippingCost,
          transaction: orderTransaction._id,
        },
        { new: true, session },
      );

      if (!order) throw new BadRequestException(ErrorMessage.ORDER_NOT_FOUND);

      if (order.paymentMethod === PaymentMethod.VNPAY) {
        return await this.paymentService.createPaymentUrl(
          transactionAmount,
          order._id,
          VNPAY_FASHION_PRODUCT_TYPE,
          `Order ${order.name}`,
          ipAddress,
        );
      }

      return `${this.configService.get("CLIENT_URL")}/order/result/${orderId}`;
    });
  }

  async orderTransactionCallback(orderId: string, payDate: string, success: boolean) {
    const order: Order = await this.find(orderId, undefined, [
      {
        path: "items",
        populate: [
          {
            path: "cost",
            model: "Cost",
          },
          {
            path: "product",
            model: "Product",
            select: ["_id", "name", "images"],
          },
          {
            path: "option",
            model: "Option",
          },
        ],
      },
      "transaction",
    ]);

    if (!order) {
      throw new NotAcceptableException(`${ErrorMessage.ORDER_NOT_FOUND}: ${orderId}`);
    }

    if (success) {
      await this.orderTransactionModel.updateOne(
        { _id: order.transaction._id || order.transaction },
        {
          status: TransactionStatus.SUCCESS,
          payDate,
        },
        { new: true },
      );
      await this.update(order._id, {
        status: OrderStatus.PREPARING,
      });
    } else {
      await this.orderTransactionModel.updateOne(
        { _id: order.transaction._id || order.transaction },
        {
          status: TransactionStatus.FAIL,
          payDate,
        },
        { new: true },
      );
    }

    const rawOrder: Order = JSON.parse(JSON.stringify(order));

    this.mailerService.sendMail({
      to: rawOrder.email,
      subject: success ? MailSubject.ORDER_PAYMENT_SUCCESS : MailSubject.ORDER_PAYMENT_FAILED,
      template: "order-result",
      context: {
        orderId: rawOrder._id,
        createdAt: rawOrder.createdAt?.toLocaleString(),
        customerName: rawOrder.name || "Khách hàng",
        email: rawOrder.email || "N/A",
        phone: rawOrder.phone || "N/A",
        address: rawOrder.address || "N/A",
        items: rawOrder.items || [],
        paymentMethod: rawOrder.paymentMethod || "Không xác định",
        totalCost: (rawOrder.totalCost || 0).toLocaleString(),
        discountCost: (rawOrder.discountCost || 0).toLocaleString(),
        shippingCost: (rawOrder.shippingCost || 0).toLocaleString(),
        finalCost:
          (rawOrder.totalCost || 0) - (rawOrder.discountCost || 0) + (rawOrder.shippingCost || 0).toLocaleString(),
        isPaymentTransactionSuccess: rawOrder?.transaction?.status === TransactionStatus.SUCCESS,
      },
    });
  }

  async requestCancelOrder(orderId: string, userId: string): Promise<boolean> {
    const order: Order = await this.find(orderId, ["status", "user"]);

    if (!!order.user && order.user.toString() != userId) {
      throw new ForbiddenException(ErrorMessage.FORBIDDEN);
    }

    if (!this.isCanBeCanceledStatus(order.status)) {
      throw new BadRequestException(ErrorMessage.ORDER_CANT_CANCEL);
    }

    await this.update(orderId, { status: OrderStatus.CANCELING });

    return true;
  }

  async cancelOrder(orderId: string, payload: CancelOrderPayload, ipAddress: string): Promise<void> {
    const order: Order = await this.find(orderId, ["transaction", "email", "status", "name"], {
      path: "transaction",
      model: "OrderTransaction",
    });

    if (!order) throw new BadRequestException(ErrorMessage.ORDER_NOT_FOUND);

    if (!this.isCanBeCanceledStatus(order.status)) {
      throw new BadRequestException(ErrorMessage.ORDER_CANT_CANCEL);
    }

    return await withMutateTransaction<Order, void>(this._model, async (session) => {
      if (payload.accept) {
        const updateResult = await this.update({ _id: orderId }, { status: OrderStatus.CANCELED }, { session });

        if (!updateResult) {
          throw new InternalServerErrorException(ErrorMessage.ORDER_CANCEL_FAILED);
        }

        await this.paymentService.refundTransaction(
          order.transaction.amount,
          orderId,
          ipAddress,
          order.transaction.payDate,
        );
      }

      this.sendCancelOrderEmail(order, payload);
    });
  }

  private async createOrderItem(cartItemId: string, session: ClientSession): Promise<OrderItem> {
    const cartItem: CartItem = await this.cartService.find(cartItemId, undefined, [
      {
        path: "product",
        model: "Product",
        select: ["_id", "currentCost"],
      },
      {
        path: "option",
        model: "Option",
        select: "_id",
      },
    ]);

    if (!cartItem) throw new BadRequestException(ErrorMessage.ORDER_UNKNOW_ERROR);

    const { product, option, quantity } = cartItem;

    if (!product || product.isDeleted) {
      throw new BadRequestException(ErrorMessage.PRODUCT_NOT_FOUND);
    }

    if (!option) {
      throw new BadRequestException(ErrorMessage.PRODUCT_OPTION_NOT_FOUND);
    }

    if (option.stock < quantity) throw new BadRequestException(ErrorMessage.PRODUCT_SOLD_OUT);

    await this.optionModel.updateOne(
      { _id: new Types.ObjectId(option._id) },
      { $inc: { stock: -quantity } },
      { session },
    );

    await this.cartService.delete(cartItemId);

    const orderItem = await this.orderItemModel.create(
      [
        {
          product: new Types.ObjectId(product._id),
          option: new Types.ObjectId(option._id),
          quantity,
          cost: new Types.ObjectId(`${product.currentCost}`),
        },
      ],
      { session },
    );

    return await orderItem[0].populate("cost");
  }

  private calculateTotalCost(items: OrderItem[]): { totalCost: number; discountCost: number } {
    return items.reduce(
      (acc, current) => {
        const discountCost = (current.cost.saleCost * current.cost.discountPercentage) / 100;
        const itemTotal = (current.cost.saleCost - discountCost) * current.quantity;

        acc.discountCost += discountCost * current.quantity;
        acc.totalCost += itemTotal;

        return acc;
      },
      { totalCost: 0, discountCost: 0 },
    );
  }

  private sendCancelOrderEmail(order: Order, payload: CancelOrderPayload): void {
    const mailOptions: ISendMailOptions = {
      to: order.email,
    };

    if (order.status === OrderStatus.CANCELING) {
      if (payload.accept) {
        Object.assign(mailOptions, {
          template: "order-canceled",
          context: { user: order.name, orderId: order._id },
          subject: MailSubject.ORDER_CANCELED,
        });
      } else {
        Object.assign(mailOptions, {
          template: "order-cancel-request-rejected",
          context: { user: order.name, reason: payload.reason },
          subject: MailSubject.ORDER_CANCEL_REQUEST_REJECTED,
        });
      }
    } else {
      Object.assign(mailOptions, {
        template: "order-canceled-by-admin",
        context: { user: order.name, reason: payload.reason },
        subject: MailSubject.ORDER_CANCELED,
      });
    }

    this.mailerService.sendMail(mailOptions);
  }

  private isCanBeCanceledStatus(status: OrderStatus) {
    const preventCancelStatus: Array<OrderStatus> = [
      OrderStatus.TRANSPORTING,
      OrderStatus.CANCELED,
      OrderStatus.COMPLETED,
    ];

    return !preventCancelStatus.includes(status);
  }

  async createPendingTransaction(amount: number, session: ClientSession): Promise<OrderTransaction> {
    const [createdTransaction] = await this.orderTransactionModel.create(
      [
        {
          amount,
        },
      ],
      { session },
    );

    return createdTransaction;
  }
}
