import { CalcDeliveryFeePayload } from "@app/models";
import { DeliveryService } from "@app/services/delivery.service";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@Controller("delivery")
@ApiTags("delivery")
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Post("/fee")
  async calcDeliveryFee(@Body() payload: CalcDeliveryFeePayload) {
    // return await this.deliveryService.calcFee(payload);
  }
}
