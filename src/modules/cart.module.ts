import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { ProductModule } from "@app/modules/product.module";
import { CartItem, CartItemSchema } from "@app/schemas";
import { UserModule } from "@app/modules/user.module";
import { CartController } from "@app/controllers";
import { CartService } from "@app/services";

@Module({
  imports: [
    UserModule,
    ProductModule,
    MongooseModule.forFeature([
      {
        name: CartItem.name,
        schema: CartItemSchema,
      },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
