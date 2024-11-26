import { ClientSession, Model, Types } from "mongoose";
import { ISendMailOptions, MailerService } from "@nestjs-modules/mailer";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
} from "@nestjs/common";

import { CancelOrderPayload, CreateOrderPayload, PaginationResponse, ProcessOrderPayload, UpdateOrderPayload } from "@app/models";
import { Option, Order, OrderItem, OrderTransaction, Product } from "@app/schemas";
import { ErrorMessage, MailSubject, OrderStatus, PaymentMethod } from "@app/enums";
import { ORDER_CACHE_PREFIX, VNPAY_FASHION_PRODUCT_TYPE } from "@app/constants";
import { RepositoryService } from "@app/services/repository.service";
import { DeliveryService } from "@app/services/delivery.service";
import { PaymentService } from "@app/services/payment.service";
import { ProductService } from "./product.service";
import { withMutateTransaction } from "@app/utils";
import { CacheService } from "./cache.service";
import { CartService } from "./cart.service";

@Injectable()
export class OrderService extends RepositoryService<Order> {
  constructor(
    @InjectModel(OrderItem.name) private readonly orderItemModel: Model<OrderItem>,
    @InjectModel(Option.name) private readonly optionModel: Model<Option>,
    private readonly deliveryService: DeliveryService,
    private readonly paymentService: PaymentService,
    private readonly productService: ProductService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly cartService: CartService,
    cacheService: CacheService,
    @InjectModel(Order.name)
    orderModel: Model<Order>,
  ) {
    super(orderModel, cacheService, ORDER_CACHE_PREFIX);
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
        {
          path: "transaction",
          model: "OrderTransaction",
        },
      ],
      false,
      `detail`,
    );

    if (!order) throw new BadRequestException(ErrorMessage.ORDER_NOT_FOUND);
    return order;
  }

  async createOrder(payload: CreateOrderPayload, userId: string): Promise<Order> {
    return withMutateTransaction<Order>(this._model, async (session) => {
      const createdItems = await Promise.all(
        payload.items.map((item) => this.createOrderItem(item.productId, item.optionId, item.quantity, session)),
      );

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

  async processOrder(
    orderId: string,
    userId: string,
    payload: ProcessOrderPayload,
    ipAddress: string,
  ): Promise<string> {
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
      const orderTransaction: OrderTransaction = await this.paymentService.createPendingTransaction(
        transactionAmount,
        session,
      );

      const order = await this._model
        .findOneAndUpdate(
          { _id: orderId },
          {
            ...updates,
            addressCode,
            shippingCost,
            transaction: orderTransaction._id,
          },
          { new: true, session },
        )
        .populate({
          path: "items",
          populate: {
            path: "cost",
            model: "Cost",
          },
          model: "OrderItem",
        })
        .exec();

      if (!order) throw new BadRequestException(ErrorMessage.ORDER_NOT_FOUND);

      if (userId) {
        await this.cartService.deleteCartItem(
          userId,
          order.items.map(({ _id }) => new Types.ObjectId(_id)),
        );
      }

      if (order.paymentMethod === PaymentMethod.VNPAY) {
        return await this.paymentService.createPaymentUrl(
          transactionAmount,
          order._id,
          VNPAY_FASHION_PRODUCT_TYPE,
          `Order ${order.name}`,
          ipAddress,
        );
      }

      return `${this.configService.get("CLIENT_URL")}/order/result?id=${orderId}`;
    });
  }

  async updateOrder(orderId: string, updates: UpdateOrderPayload): Promise<Order> {
    const order = await this._model.findByIdAndUpdate(orderId, updates, { new: true });
    if (!order) throw new BadRequestException(ErrorMessage.ORDER_NOT_FOUND);
    return order;
  }

  async requestCancelOrder(orderId: string, userId: string): Promise<boolean> {
    const order: Order = await this.find(orderId, ["status", "user"]);

    if (!!order.user && order.user.toString() != userId) {
      throw new ForbiddenException(ErrorMessage.FORBIDDEN);
    }

    if (
      order.status != OrderStatus.PREPARING &&
      order.status != OrderStatus.CANCELED &&
      order.status != OrderStatus.COMPLETED
    ) {
      throw new NotAcceptableException(ErrorMessage.ORDER_CANT_CANCEL);
    }

    await this._model.updateOne({ _id: orderId }, { status: OrderStatus.CANCELING });

    return true;
  }

  async cancelOrder(orderId: string, payload: CancelOrderPayload, ipAddress: string): Promise<void> {
    const order: Order = await this.find(orderId, ["transaction", "email", "status", "name"], {
      path: "transaction",
      model: "OrderTransaction",
    });

    if (!order) throw new BadRequestException(ErrorMessage.ORDER_NOT_FOUND);

    return await withMutateTransaction<Order, void>(this._model, async (session) => {
      const updateResult = await this._model.updateOne({ _id: orderId }, { status: OrderStatus.CANCELED }, { session });

      if (updateResult.modifiedCount <= 0) {
        throw new InternalServerErrorException(ErrorMessage.ORDER_CANCEL_FAILED);
      }

      await this.paymentService.refundTransaction(
        order.transaction.amount,
        orderId,
        ipAddress,
        order.transaction.payDate,
      );

      const mailOptions: ISendMailOptions = {
        to: order.email,
        subject: MailSubject.ORDER_CANCELED,
      };

      if (order.status === OrderStatus.CANCELING) {
        Object.assign(mailOptions, {
          template: "order-canceled",
          context: { user: order.name, orderId: orderId },
        });
      } else {
        const { reason } = payload;

        Object.assign(mailOptions, {
          template: "order-canceled-by-admin",
          context: { user: order.name, reason: reason },
        });
      }

      this.mailerService.sendMail(mailOptions);
    });
  }

  private async createOrderItem(
    productId: string,
    optionId: string,
    quantity: number,
    session: ClientSession,
  ): Promise<OrderItem> {
    const product: Product = await this.productService.find(productId, undefined, ["options"]);
    const option: Option = product.options.find(({ _id }) => _id == optionId);

    if (!product || product.isDeleted) {
      throw new BadRequestException(ErrorMessage.PRODUCT_NOT_FOUND);
    }

    if (!option) {
      throw new BadRequestException(ErrorMessage.PRODUCT_OPTION_NOT_FOUND);
    }
    if (option.stock < quantity) throw new BadRequestException(ErrorMessage.PRODUCT_SOLD_OUT);

    await this.optionModel.updateOne({ _id: optionId }, { $inc: { stock: -quantity } }, { session });

    const orderItem = await this.orderItemModel.create(
      [
        {
          product: new Types.ObjectId(productId),
          option: new Types.ObjectId(optionId),
          quantity,
          cost: product.currentCost,
        },
      ],
      { session },
    );

    return orderItem[0];
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
}
