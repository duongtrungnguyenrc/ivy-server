import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Cart, CartItem } from "@app/schemas";
import { ProductService } from "./product.service";
import { AddCartItemPayload } from "@app/models";
import { ErrorMessage } from "@app/enums";
import { withMutateTransaction } from "@app/utils";

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<Cart>,
    @InjectModel(CartItem.name)
    private readonly cartItemModel: Model<CartItem>,
    private readonly productService: ProductService,
  ) {}

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

    return withMutateTransaction<CartItem, Cart>(this.cartItemModel, async (session) => {
      const productExists = await this.productService.checkProductAndOptionExist(productId, optionId);

      if (!productExists) {
        throw new BadRequestException(ErrorMessage.PRODUCT_NOT_FOUND);
      }

      const newItems = await this.cartItemModel.create(
        [{ product: new Types.ObjectId(productId), option: new Types.ObjectId(optionId), quantity }],
        { session },
      );

      return await this.cartModel
        .findOneAndUpdate(
          { user: new Types.ObjectId(userId) },
          { $push: { items: newItems[0] } },
          { session, new: true, upsert: true },
        )
        .populate(this.getCartPopulationOptions())
        .exec();
    });
  }

  async getOrCreateCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel
      .findOne({ user: new Types.ObjectId(userId) })
      .populate(this.getCartPopulationOptions())
      .exec();

    if (cart) {
      return cart;
    }

    const newCart = await this.cartModel.create({ user: new Types.ObjectId(userId) });
    return newCart.populate(this.getCartPopulationOptions());
  }

  async deleteCartItem(userId: string, itemId: Types.ObjectId | Types.ObjectId[]): Promise<Cart | null> {
    const cart = await this.cartModel.findOne({
      user: new Types.ObjectId(userId),
    });

    const updatedCart = await this.cartModel
      .findByIdAndUpdate(cart._id, { $pull: { items: { $in: itemId } } }, { new: true })
      .exec();

    if (updatedCart) {
      if (Array.isArray(itemId)) {
        await this.cartItemModel.deleteMany({ _id: { $in: itemId } }).exec();
      } else {
        await this.cartItemModel.findByIdAndDelete(itemId).exec();
      }
    }

    return updatedCart;
  }
}
