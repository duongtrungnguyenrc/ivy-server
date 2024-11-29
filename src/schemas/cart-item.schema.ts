import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { BaseSchema } from "./base.schema";
import { Product } from "./product.schema";
import { Option } from "./option.schema";
import { User } from "./user.schema";

@Schema()
export class CartItem extends BaseSchema {
  @Prop({ type: mongoose.Types.ObjectId, ref: "User", required: false })
  user?: User;

  @Prop({ type: mongoose.Types.ObjectId, ref: "Product" })
  product: Product;

  @Prop({ type: mongoose.Types.ObjectId, ref: "Option" })
  option: Option;

  @Prop({ default: 1 })
  quantity: number;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);
