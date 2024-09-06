import { CartController } from "@app/controllers";
import { Cart, CartItem, CartItemSchema, CartSchema } from "@app/schemas";
import { CartService } from "@app/services";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "./user.module";
import { ProductModule } from "./product.module";

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
  providers: [CartService],
})
export class CartModule {}
