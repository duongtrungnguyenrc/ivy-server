import { Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";

import { PaymentService } from "@app/services";
import { ApiTags, ApiTemporaryRedirectResponse } from "@nestjs/swagger";

@Controller("payment")
@ApiTags("payment")
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get("/callback")
  @ApiTemporaryRedirectResponse()
  async paymentCallback(@Query() callbackParams: Vnp.CallbackParams, @Res() response: Response): Promise<void> {
    await this.paymentService.paymentCallback(callbackParams, response);
  }
}
