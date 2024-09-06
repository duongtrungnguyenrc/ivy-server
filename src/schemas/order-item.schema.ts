import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { BaseSchema } from "./base.schema";
import { Product } from "./product.schema";
import { Option } from "./option.schema";
import { Cost } from "./cost.schema";

@Schema()
export class OrderItem extends BaseSchema {
  @Prop({ type: mongoose.Types.ObjectId, ref: "Product" })
  product: Product;

  @Prop({ type: mongoose.Types.ObjectId, ref: "Option" })
  option: Option;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({ type: mongoose.Types.ObjectId, ref: "Cost" })
  cost: Cost;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);
