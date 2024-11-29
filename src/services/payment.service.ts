import { forwardRef, Inject, Injectable, InternalServerErrorException, NotAcceptableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Response } from "express";
import { format } from "date-fns";
import * as crypto from "crypto";
import { stringify } from "qs";

import { ErrorMessage, VnpayTransactionRefundType, VnpayTransactionStatus } from "@app/enums";
import { VnpayTransactionCommand } from "@app/enums/vnpay-command.enum";
import { OrderService } from "@app/services/order.service";
import { Order } from "@app/schemas";
import { HttpService } from "@nestjs/axios";

@Injectable()
export class PaymentService {
  constructor(
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async createPaymentUrl(
    amount: number,
    orderId: string,
    orderType: string | number,
    orderDescription: string,
    ipAddr: string,
  ): Promise<string> {
    try {
      const returnUrl = this.configService.get<string>("VNP_RETURN_URL");
      const locale = this.configService.get<string>("DEFAULT_LOCALE");

      const vnpPayParams: Vnp.PayParams = this.buildVnpBaseParams(
        amount,
        orderId,
        orderDescription,
        ipAddr,
        VnpayTransactionCommand.PAY,
        (baseParams) => {
          return {
            ...baseParams,
            vnp_ReturnUrl: returnUrl,
            vnp_OrderType: orderType,
            vnp_Locale: locale,
            vnp_CurrCode: "VND",
          };
        },
      );

      return `${this.configService.get("VNP_URL")}?${stringify(vnpPayParams, { encode: false })}`;
    } catch (error) {
      throw new InternalServerErrorException(`${ErrorMessage.CREATE_PAYMENT_TRANSACTION_FAILED}: ${error.message}`);
    }
  }

  async paymentCallback(params: Vnp.CallbackParams, response: Response) {
    const { vnp_TransactionStatus: status, vnp_PayDate: payDate, vnp_TxnRef: orderId } = params;

    const order: Order = await this.orderService.find(orderId, ["transaction"]);

    if (!order) {
      throw new NotAcceptableException(`${ErrorMessage.ORDER_NOT_FOUND}: ${orderId}`);
    }

    await this.orderService.orderTransactionCallback(orderId, payDate, status === VnpayTransactionStatus.SUCCESS);

    const clientUrl: string = this.configService.get<string>("CLIENT_URL");
    response.redirect(`${clientUrl}/order/result/${orderId}`);
  }

  async refundTransaction(
    amount: number,
    orderId: string,
    ipAddr: string,
    transactionDate: string | Date,
    transactionType: VnpayTransactionRefundType = VnpayTransactionRefundType.FULL,
  ): Promise<boolean> {
    const formatedPayDate: string = format(new Date(transactionDate), "YYYYMMDDHHmmss");

    const vnpayRefundParams: Vnp.RefundParams = this.buildVnpBaseParams(
      amount,
      orderId,
      "Refund transaction",
      ipAddr,
      VnpayTransactionCommand.REFUND,
      (baseParams) => ({
        ...baseParams,
        vnp_TransactionNo: "0",
        vnp_TransactionType: transactionType,
        vnp_RequestId: vnpRequestId,
        vnp_CreateBy: "System",
        vnp_TransactionDate: formatedPayDate,
      }),
    );

    const vnpayApiUrl: string = this.configService.get<string>("VNP_API");
    const vnpRequestId = format(new Date(), "HHmmss");

    return new Promise((resolve, reject) => {
      this.httpService.post(vnpayApiUrl, vnpayRefundParams).subscribe({
        next: () => {
          resolve(true);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  private buildVnpBaseParams<T extends Vnp.BaseParams>(
    amount: number,
    orderId: string,
    orderDescription: string,
    ipAddr: string,
    command: VnpayTransactionCommand,
    bind: (baseParams: Omit<Vnp.BaseParams, "vnp_SecureHash">) => Omit<T, "vnp_SecureHash">,
  ): T {
    const tmnCode = this.configService.get<string>("VNP_TMN_CODE");
    const secretKey = this.configService.get<string>("VNP_HASH_SECRET");
    const version = this.configService.get<string>("VNP_VERSION");
    const createDate = format(new Date(), "yyyyMMddHHmmss");

    const vnpBaseParams: Omit<Vnp.BaseParams, "vnp_SecureHash"> = {
      vnp_Version: version,
      vnp_Command: command,
      vnp_TmnCode: tmnCode,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderDescription,
      vnp_Amount: amount * 100,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    const params: Omit<T, "vnp_SecureHash"> = bind(vnpBaseParams);

    const sortedParams = this.sortObject(params);
    const signData = stringify(sortedParams, { encode: false });
    const vnpSecureHash = crypto.createHmac("sha512", secretKey).update(signData, "utf-8").digest("hex");

    return {
      ...(sortedParams as T),
      vnp_SecureHash: vnpSecureHash,
    };
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
