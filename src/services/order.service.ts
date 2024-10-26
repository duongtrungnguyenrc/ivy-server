import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ClientSession, Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import { format } from "date-fns";
import * as querystring from "qs";
import * as crypto from "crypto";

import { ErrorMessage, OrderStatus, PaymentMethod, VnpayTransactionStatus } from "@app/enums";
import { ORDER_CACHE_PREFIX, VNPAY_FASHION_PRODUCT_TYPE } from "@app/constants";
import { CreateOrderPayload, ProcessOrderPayload, UpdateOrderPayload } from "@app/models";
import { Option, Order, OrderItem, Product } from "@app/schemas";
import { ProductService } from "./product.service";
import { withMutateTransaction } from "@app/utils";
import { CacheService } from "./cache.service";
import { CartService } from "./cart.service";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    @InjectModel(OrderItem.name)
    private readonly orderItemModel: Model<OrderItem>,
    private readonly cartService: CartService,
    private readonly productService: ProductService,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {}

  async getOrder(id: string, force: boolean = false): Promise<Order> {
    const cachedOrder: Order | undefined = await this.cacheService.get(ORDER_CACHE_PREFIX);

    if (cachedOrder && !force) return cachedOrder;

    return await this.orderModel.findById(id).populate({
      path: "items",
      populate: {
        path: "cost",
        model: "Cost",
      },
    });
  }

  async createOrder(payload: CreateOrderPayload, userId: string): Promise<Order> {
    const session: ClientSession = await this.orderModel.db.startSession();

    return withMutateTransaction(session, async () => {
      const { items, ...order } = payload;

      const createdItems: OrderItem[] = await Promise.all(
        items.map(async ({ productId, optionId, quantity }) => {
          const product: Product = await this.productService.findProductById(productId, ["options"]);
          const option: Option = product.options.find(({ _id }) => _id == optionId);

          if (!product || product.isDeleted) {
            throw new BadRequestException(ErrorMessage.PRODUCT_NOT_FOUND);
          }

          if (!option) {
            throw new BadRequestException(ErrorMessage.PRODUCT_OPTION_NOT_FOUND);
          }

          if (option.stock <= 0 || option.stock < quantity) {
            throw new BadRequestException(ErrorMessage.PRODUCT_SOLD_OUT);
          }

          this.productService.updateProductOptionById(optionId, {
            stock: option.stock - quantity,
          });

          const createdItem = await this.orderItemModel.create(
            [
              {
                product: product,
                cost: product.currentCost,
                option: option,
                quantity,
              },
            ],
            { session },
          );

          return await createdItem[0].populate("cost");
        }),
      );

      const createdOrder: Order = await this.orderModel.create({
        ...order,
        items: createdItems.map(({ _id }) => new Types.ObjectId(_id)),
        user: new Types.ObjectId(userId),
      });

      return createdOrder;
    });
  }

  async processOrder(orderId: string, payload: ProcessOrderPayload, ipAddress: string, res: Response) {
    const session: ClientSession = await this.orderModel.db.startSession();

    return withMutateTransaction(session, async () => {
      const order: Order = await (
        await this.orderModel.findOneAndUpdate({ _id: orderId }, payload, { new: true, session })
      ).populate("items");

      if (!order) throw new BadRequestException(ErrorMessage.ORDER_NOT_FOUND);

      const totalCost: number = order.items.reduce((prev, current) => {
        const { saleCost, discountPercentage } = current.cost;

        const discountCost = (saleCost * discountPercentage) / 100;

        return (saleCost - discountCost) * current.quantity + prev;
      }, 0);

      if (order.paymentMethod === PaymentMethod.VNPAY) {
        const paymentUrl: string = await this.createPaymentUrl(
          totalCost,
          order._id,
          VNPAY_FASHION_PRODUCT_TYPE,
          `Đơn hàng Ivy cho ${order.name}`,
          ipAddress,
        );

        res.redirect(paymentUrl);
        return order;
      }
    });
  }

  async paymentCallback(request: Request, response: Response): Promise<void> {
    const { vnp_TransactionStatus, vnp_TxnRef: orderId } = request.query;
    const clientBaseUrl: string = this.configService.get<string>("CLIENT_PROD_URL");
    const returnRoute = `${clientBaseUrl}/order/result`;

    if (vnp_TransactionStatus === VnpayTransactionStatus.SUCCESS) {
      await this.orderModel.findByIdAndUpdate(
        orderId,
        {
          status: OrderStatus.PREPARING,
        },
        { new: true },
      );
    }

    const redirectUrl: string = `${returnRoute}?id=${orderId}&status=${vnp_TransactionStatus}`;

    response.redirect(redirectUrl);
  }

  async updateOrder(id: string, updates: UpdateOrderPayload): Promise<Order> {
    const order: Order = await this.orderModel.findByIdAndUpdate(id, updates);

    if (!order) {
      throw new BadRequestException(ErrorMessage.ORDER_NOT_FOUND);
    }

    return order;
  }

  private async createPaymentUrl(
    amount: number,
    orderId: string,
    orderType: string | number,
    orderDescription: string,
    ipAddr: string,
  ): Promise<string> {
    try {
      const tmnCode = this.configService.get<string>("VNP_TMN_CODE");
      const secretKey = this.configService.get<string>("VNP_HASH_SECRET");
      const vnpUrl = this.configService.get<string>("VNP_URL");
      const returnUrl = this.configService.get<string>("VNP_RETURN_URL");

      const date = new Date();
      const createDate = format(date, "yyyyMMddHHmmss");

      const currCode = "VND";

      const vnp_Params: Record<string, string | number> = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: "vn",
        vnp_CurrCode: currCode,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderDescription,
        vnp_OrderType: orderType,
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      const sortedParams = this.sortObject(vnp_Params);

      const signData = querystring.stringify(sortedParams, { encode: false });
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
      sortedParams["vnp_SecureHash"] = signed;

      const paymentUrl = `${vnpUrl}?${querystring.stringify(sortedParams, { encode: false })}`;

      return paymentUrl;
    } catch (error) {
      throw new InternalServerErrorException(`${ErrorMessage.CREATE_PAYMENT_TRANSACTION_FAILED}: ${error.message}`);
    }
  }

  private sortObject(obj: object): object {
    const sorted: object = {};

    const str: string[] = Object.keys(obj)
      .map((key) => {
        return encodeURIComponent(key);
      })
      .sort();

    str.forEach((_, index) => {
      sorted[str[index]] = encodeURIComponent(obj[str[index]]).replace(/%20/g, "+");
    });

    return sorted;
  }
}
