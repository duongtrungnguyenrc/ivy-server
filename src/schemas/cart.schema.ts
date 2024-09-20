import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { CartItem } from "./cart-item.schema";
import { BaseSchema } from "./base.schema";
import { User } from "./user.schema";

@Schema()
export class Cart extends BaseSchema {
  @Prop({ type: mongoose.Types.ObjectId, ref: "User", required: true })
  user: User;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId }], ref: "CartItem", default: [] })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
