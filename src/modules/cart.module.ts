import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { Cart, CartItem, CartItemSchema, CartSchema } from "@app/schemas";
import { CartItemService, CartService } from "@app/services";
import { ProductModule } from "@app/modules/product.module";
import { UserModule } from "@app/modules/user.module";
import { CartController } from "@app/controllers";

@Module({
  imports: [
    UserModule,
    ProductModule,
    MongooseModule.forFeature([
      {
        name: Cart.name,
        schema: CartSchema,
      },
      {
        name: CartItem.name,
        schema: CartItemSchema,
      },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService, CartItemService],
  exports: [CartService, CartItemService],
})
export class CartModule {}
