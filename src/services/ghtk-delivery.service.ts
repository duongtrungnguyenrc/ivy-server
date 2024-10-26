import { ConfigService } from "@nestjs/config";
import axios from "axios";

import { CalcDeliveryFeePayload } from "@app/models";
import { IDeliveryService } from "@app/abstracts";
import { Injectable } from "@nestjs/common";
import { Order } from "@app/schemas";

@Injectable()
export class GhtkDeliveryService implements IDeliveryService {
  private apiToken: string;

  constructor(private readonly configService: ConfigService) {
    this.apiToken = this.configService.get<string>("GHTK_API_TOKEN");
  }

  async calcFee(payload: CalcDeliveryFeePayload): Promise<number> {
    const { toAddressCode, cost } = payload;
    const [wardCode, districtId] = toAddressCode;

    const getFeePayload = {
      pick_province: "Hà Nội",
      pick_district: "Cầu Giấy",
      province: "Hồ Chí Minh",
      district: districtId,
      address: wardCode,
      weight: 200,
      value: cost,
    };

    const response = await axios.get(
      `https://services.ghtk.vn/services/shipment/fee?${new URLSearchParams(JSON.stringify(getFeePayload))}`,
      {
        headers: {
          Token: this.apiToken,
        },
      },
    );

    return response.data.fee.ship_fee_only;
  }

  async createOrder(payload: Order): Promise<any> {}

  handleCallback(data: any): void {}
}
