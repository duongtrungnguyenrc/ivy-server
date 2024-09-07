import { AddCartItemPayload } from "@app/models";
import { Cart, CartItem, User } from "@app/schemas";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { UserService } from "./user.service";
import { ProductService } from "./product.service";

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<Cart>,
    @InjectModel(CartItem.name)
    private readonly cartItemModel: Model<CartItem>,
    private readonly userService: UserService,
    private readonly productService: ProductService,
  ) {}

  async addCartItem(payload: AddCartItemPayload, request: Request): Promise<Cart> {
    const { productId, optionId, quantity } = payload;

    const [product, option] = await Promise.all([
      this.productService.findProductById(productId),
      this.productService.findProductOptionById(optionId),
    ]);

    if (!product) {
      throw new BadRequestException("Product not found");
    }

    if (!option) {
      throw new BadRequestException("Product option not found");
    }

    const newItem = await this.cartItemModel.create({ product, option, quantity });

    const user: User = await this.userService.findUserFromAuth(request);

    const cart: Cart = await this.cartModel.findOneAndUpdate(
      { user: user._id },
      { $addToSet: { items: newItem } },
      { new: true, upsert: true },
    );

    return cart;
  }

  async deleteCartItem() {}
}
