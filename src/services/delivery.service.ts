import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { AxiosResponse } from "axios";
import { Observable } from "rxjs";

import { ErrorMessage } from "@app/enums";

@Injectable()
export class DeliveryService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async calcFee(totalCost: number, districtId: number, wardCode: string, items: Array<Ghn.Item>): Promise<number> {
    const shopDistrictId: number = Number(this.configService.get<number>("GHN_SHOP_DISTRICT_ID"));
    const shopWardCode: string = this.configService.get<string>("GHN_SHOP_WARD_CODE");
    const ghnBasePackageSize: number = Number(this.configService.get<number>("GHN_BASE_PACKAGE_SIZE"));
    const ghnBasePackageWeight: number = Number(this.configService.get<number>("GHN_BASE_PACKAGE_WEIGHT"));

    const availableServices = await this.getAvailableServices(districtId);

    if (availableServices.length <= 0) {
      throw new ServiceUnavailableException(ErrorMessage.DELIVERY_SERVICE_UNAVAILABLE);
    }

    const getFeePayload: Ghn.CalcShippingFeePayload = {
      from_district_id: shopDistrictId,
      from_ward_code: shopWardCode,
      to_district_id: districtId,
      to_ward_code: wardCode.toString(),
      height: ghnBasePackageSize,
      width: ghnBasePackageSize,
      length: ghnBasePackageSize,
      weight: ghnBasePackageWeight,
      service_id: availableServices[0].service_id,
      service_type_id: availableServices[0].service_type_id,
      insurance_value: totalCost,
      cod_failed_amount: 0,
      items: items,
    };

    const query: Observable<AxiosResponse<Ghn.Response<Ghn.ShippingFee>>> = this.httpService.post(
      `/fee`,
      getFeePayload,
    );

    return new Promise((resolve, reject) => {
      query.subscribe({
        next: (data) => {
          resolve(data.data.data.total);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  }

  getPackageItemInfo(quantity: number = 1) {
    const ghnBasePackageSize: number = this.configService.get<number>("GHN_BASE_PACKAGE_SIZE");
    const ghnBasePackageWeight: number = this.configService.get<number>("GHN_BASE_PACKAGE_WEIGHT");

    return {
      height: ghnBasePackageSize * quantity,
      width: ghnBasePackageSize * quantity,
      length: ghnBasePackageSize * quantity,
      weight: ghnBasePackageWeight * quantity,
    };
  }

  private async getAvailableServices(toDistrictId: number): Promise<Array<Ghn.Service>> {
    const shopDistrictId: number = Number(this.configService.get("GHN_SHOP_DISTRICT_ID"));
    const shopId: number = Number(this.configService.get("GHN_SHOP_ID"));

    const payload: Ghn.GetAvailableServicesPayload = {
      shop_id: shopId,
      from_district: shopDistrictId,
      to_district: toDistrictId,
    };

    const response: Observable<AxiosResponse<Ghn.Response<Array<Ghn.Service>>>> = this.httpService.post(
      `/available-services`,
      payload,
    );

    return new Promise((resolve, reject) => {
      response.subscribe({
        next: (data: AxiosResponse<Ghn.Response<Array<Ghn.Service>>>) => {
          resolve(data.data.data);
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }

  // handleCallback(data: any): void {}
}
