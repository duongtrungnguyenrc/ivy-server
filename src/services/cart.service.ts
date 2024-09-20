import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { Cart, CartItem } from "@app/schemas";
import { ProductService } from "./product.service";
import { AddCartItemPayload } from "@app/models";
import { ErrorMessage } from "@app/enums";

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<Cart>,
    @InjectModel(CartItem.name)
    private readonly cartItemModel: Model<CartItem>,
    private readonly productService: ProductService,
  ) {}

  async addCartItem(payload: AddCartItemPayload, userId: string): Promise<Cart> {
    const { productId, optionId, quantity } = payload;

    const session = await this.cartItemModel.db.startSession();
    session.startTransaction();

    try {
      const productExists = await this.productService.checkProductAndOptionExist(productId, optionId);
      if (!productExists) {
        throw new BadRequestException(ErrorMessage.PRODUCT_NOT_FOUND);
      }

      const newItems = await this.cartItemModel.create(
        [
          {
            product: new Types.ObjectId(productId),
            option: new Types.ObjectId(optionId),
            quantity,
          },
        ],
        { session },
      );

      const cart: Cart = await this.cartModel
        .findOneAndUpdate(
          { user: new Types.ObjectId(userId) },
          {
            $push: { items: newItems[0] },
          },
          { session, new: true, upsert: true },
        )
        .populate({
          path: "items",
          populate: [
            {
              path: "product",
              model: "Product",
              select: ["name", "currentCost", "images"],
              populate: {
                path: "currentCost",
                model: "Cost",
              },
            },
            {
              path: "option",
              model: "Option",
            },
          ],
        })
        .exec();

      await session.commitTransaction();

      return cart;
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(error.message);
    } finally {
      session.endSession();
    }
  }

  async getOrCreateCart(userId: string): Promise<Cart> {
    const existingCart = await this.cartModel
      .findOne({ user: new Types.ObjectId(userId) })
      .populate({
        path: "items",
        populate: [
          {
            path: "product",
            model: "Product",
            select: ["name", "currentCost", "images"],
            populate: {
              path: "currentCost",
              model: "Cost",
            },
          },
          {
            path: "option",
            model: "Option",
          },
        ],
      })
      .exec();

    if (!existingCart) {
      const createdCart = await this.cartModel.create({ user: new Types.ObjectId(userId) });

      return await createdCart.populate({
        path: "items",
        populate: [
          {
            path: "product",
            model: "Product",
            populate: {
              path: "currentCost",
              model: "Cost",
            },
          },
          {
            path: "option",
            model: "Option",
          },
        ],
      });
    }

    return existingCart;
  }

  async deleteCartItem(cartId: string, itemId: string): Promise<Cart> {
    const updatedCart = await this.cartModel.findByIdAndUpdate(cartId, {
      $pull: { items: new Types.ObjectId(itemId) },
      new: true,
    });

    await this.cartItemModel.findByIdAndDelete(itemId);

    return updatedCart;
  }
}
