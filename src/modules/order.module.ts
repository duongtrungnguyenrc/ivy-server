import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { Order, OrderItem, OrderItemSchema, OrderSchema } from "@app/schemas";
import { OrderController } from "@app/controllers";
import { OrderService } from "@app/services";
import { UserModule } from "./user.module";
import { ProductModule } from "./product.module";
import { CartModule } from "./cart.module";

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
        name: OrderItem.name,
        schema: OrderItemSchema,
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
