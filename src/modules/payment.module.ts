import { forwardRef, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { OrderModule } from "@app/modules/order.module";
import { PaymentController } from "@app/controllers";
import { PaymentService } from "@app/services";

@Module({
  imports: [forwardRef(() => OrderModule), HttpModule],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
