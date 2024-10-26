import { Injectable, BadRequestException } from "@nestjs/common";

import { GhtkDeliveryService } from "./ghtk-delivery.service";
import { GhnDeliveryService } from "./ghn-delivery.service";
import { IDeliveryService } from "@app/abstracts";

@Injectable()
export class DeliveryService {
  constructor(
    private readonly ghnDelivery: GhnDeliveryService,
    private readonly ghtkDelivery: GhtkDeliveryService,
  ) {}

  getService(provider: string): IDeliveryService {
    switch (provider) {
      case "GHN":
        return this.ghnDelivery;
      case "GHTK":
        return this.ghtkDelivery;
      default:
        throw new BadRequestException("Invalid delivery provider");
    }
  }
}
