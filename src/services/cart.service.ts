import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import { RepositoryService } from "@app/services/repository.service";
import { CacheService } from "@app/services/cache.service";
import { ProductService } from "./product.service";
import { AddCartItemPayload, getCartItemPayload } from "@app/models";
import { CartItem } from "@app/schemas";
import { ErrorMessage } from "@app/enums";
import { ProductOptionService } from "./product-option.service";

@Injectable()
export class CartService extends RepositoryService<CartItem> {
  constructor(
    private readonly productService: ProductService,
    private readonly productOptionService: ProductOptionService,
    @InjectModel(CartItem.name) cartItemModel: Model<CartItem>,
    cacheService: CacheService,
  ) {
    super(cartItemModel, cacheService);
  }

  async addCartItem(payload: AddCartItemPayload, userId: string): Promise<CartItem> {
    const { productId, optionId, quantity } = payload;

    const product = await this.productService.find(productId, ["_id"]);
    const option = await this.productOptionService.find(optionId, ["_id", "stock"]);

    if (!product || !option) {
      throw new BadRequestException(ErrorMessage.PRODUCT_OPTION_NOT_FOUND);
    }

    if (option.stock < payload.quantity) {
      throw new BadRequestException(ErrorMessage.PRODUCT_SOLD_OUT);
    }

    const newItem = await this.create({
      user: userId ? new Types.ObjectId(userId) : undefined,
      product: new Types.ObjectId(productId),
      option: new Types.ObjectId(optionId),
      quantity,
    });

    if (userId) {
      await this.update({ user: new Types.ObjectId(userId) }, { $push: { items: newItem } });
    }

    return newItem;
  }

  async getCartItems(payload: getCartItemPayload, userId: string): Promise<CartItem[]> {
    if (userId) {
      return await this.findMultiple(
        { user: new Types.ObjectId(userId) },
        [],
        [
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
      );
    }

    return this.findMultiple(
      {
        _id: {
          $in: payload.ids,
        },
      },
      undefined,
      [
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
    );
  }

  async deleteCartItem(itemId: Types.ObjectId | Types.ObjectId[]): Promise<boolean> {
    const isMultipleItems = Array.isArray(itemId);

    await this.delete({ _id: isMultipleItems ? { $in: itemId } : itemId });

    return true;
  }
}
