import { forwardRef, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { OrderTransaction, OrderTransactionSchema } from "@app/schemas";
import { OrderModule } from "@app/modules/order.module";
import { PaymentController } from "@app/controllers";
import { MongooseModule } from "@nestjs/mongoose";
import { PaymentService } from "@app/services";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: OrderTransaction.name,
        schema: OrderTransactionSchema,
      },
    ]),
    forwardRef(() => OrderModule),
    HttpModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
