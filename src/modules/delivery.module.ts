import { Module } from "@nestjs/common";

import { GhtkDeliveryService } from "@app/services/ghtk-delivery.service";
import { GhnDeliveryService } from "@app/services/ghn-delivery.service";
import { DeliveryController } from "@app/controllers";
import { DeliveryService } from "@app/services";

@Module({
  controllers: [DeliveryController],
  providers: [DeliveryService, GhnDeliveryService, GhtkDeliveryService],
  exports: [DeliveryService, GhnDeliveryService, GhtkDeliveryService],
})
export class DeliveryModule {}
