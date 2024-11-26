import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { RepositoryService } from "@app/services/repository.service";
import { CartItemService } from "@app/services/cart-item.service";
import { CacheService } from "@app/services/cache.service";
import { ProductService } from "./product.service";
import { withMutateTransaction } from "@app/utils";
import { AddCartItemPayload } from "@app/models";
import { ErrorMessage } from "@app/enums";
import { Cart } from "@app/schemas";

@Injectable()
export class CartService extends RepositoryService<Cart> {
  constructor(
    private readonly cartItemService: CartItemService,
    private readonly productService: ProductService,
    @InjectModel(Cart.name)
    cartModel: Model<Cart>,
    cacheService: CacheService,
  ) {
    super(cartModel, cacheService);
  }

  private getCartPopulationOptions() {
    return {
      path: "items",
      populate: [
        {
          path: "product",
          model: "Product",
          select: ["name", "currentCost", "images"],
          populate: { path: "currentCost", model: "Cost" },
        },
        {
          path: "option",
          model: "Option",
        },
      ],
    };
  }

  async addCartItem(payload: AddCartItemPayload, userId: string): Promise<Cart> {
    const { productId, optionId, quantity } = payload;

    return withMutateTransaction<Cart>(this._model, async (session) => {
      const productExists = await this.productService.checkProductAndOptionExist(productId, optionId);

      if (!productExists) {
        throw new BadRequestException(ErrorMessage.PRODUCT_NOT_FOUND);
      }

      const newItems = await this.cartItemService.create(
        [{ product: new Types.ObjectId(productId), option: new Types.ObjectId(optionId), quantity }],
        { session },
      );

      return (
        await this.update(
          { user: new Types.ObjectId(userId) },
          { $push: { items: newItems[0] } },
          { session, new: true, upsert: true },
        )
      ).populate(this.getCartPopulationOptions());
    });
  }

  async getUserCart(userId: string): Promise<Cart> {
    const cart: Cart = await this.find(
      { user: new Types.ObjectId(userId) },
      undefined,
      this.getCartPopulationOptions(),
    );

    if (!cart) {
      return this.create({ user: new Types.ObjectId(userId) });
    }

    return cart;
  }

  async deleteCartItem(userId: string, itemId: Types.ObjectId | Types.ObjectId[]): Promise<Cart | null> {
    const cart: Cart = await this.find(
      {
        user: new Types.ObjectId(userId),
      },
      "_id",
    );

    const isMultipleItems = Array.isArray(itemId);

    const updatedCart = await this.update(cart._id, { $pull: { items: isMultipleItems ? { $in: itemId } : itemId } });

    if (updatedCart) {
      await this.cartItemService.delete({ _id: isMultipleItems ? { $in: itemId } : itemId });
    }

    return updatedCart;
  }
}
