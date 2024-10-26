import { ConfigService } from "@nestjs/config";
import axios from "axios";

import { CalcDeliveryFeePayload } from "@app/models";
import { IDeliveryService } from "@app/abstracts";
import { Injectable } from "@nestjs/common";
import { Order } from "@app/schemas";

@Injectable()
export class GhnDeliveryService implements IDeliveryService {
  private apiToken: string;
  private shopId: number;

  constructor(private readonly configService: ConfigService) {
    this.apiToken = this.configService.get<string>("GHN_API_TOKEN");
    this.shopId = this.configService.get<number>("GHN_SHOP_ID");
  }

  async calcFee(payload: CalcDeliveryFeePayload): Promise<number> {
    const { toAddressCode, cost } = payload;
    const [wardCode, districtId] = toAddressCode;

    const getFeePayload = {
      from_district_id: 1454,
      from_ward_code: "21211",
      to_district_id: parseInt(districtId),
      to_ward_code: wardCode,
      cod_value: cost,
      insurance_value: cost,
      weight: 200,
    };

    const response = await axios.post(
      "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
      getFeePayload,
      {
        headers: {
          "Content-Type": "application/json",
          Token: this.apiToken,
          ShopId: this.shopId,
        },
      },
    );

    return response.data.data.total;
  }

  async createOrder(payload: Order): Promise<any> {}

  handleCallback(data: any): void {}
}
