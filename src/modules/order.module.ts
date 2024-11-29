import { MongooseModule } from "@nestjs/mongoose";
import { forwardRef, Module } from "@nestjs/common";

import { DeliveryModule } from "@app/modules/delivery.module";
import { PaymentModule } from "@app/modules/payment.module";
import { OrderController } from "@app/controllers";
import { ProductModule } from "./product.module";
import { OrderService } from "@app/services";
import { UserModule } from "./user.module";
import { CartModule } from "./cart.module";
import {
  Order,
  OrderItem,
  Option,
  OrderItemSchema,
  OrderSchema,
  OptionSchema,
  OrderTransaction,
  OrderTransactionSchema,
} from "@app/schemas";

@Module({
  imports: [
    CartModule,
    UserModule,
    ProductModule,
    MongooseModule.forFeature([
      {
        name: Order.name,
        schema: OrderSchema,
      },
      {
        name: OrderTransaction.name,
        schema: OrderTransactionSchema,
      },
      {
        name: OrderItem.name,
        schema: OrderItemSchema,
      },
      {
        name: Option.name,
        schema: OptionSchema,
      },
    ]),
    DeliveryModule,
    forwardRef(() => PaymentModule),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
