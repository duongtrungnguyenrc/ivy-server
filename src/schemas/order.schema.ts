import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

import { OrderStatus, PaymentMethod } from "@app/enums";
import { OrderItem } from "./order-item.schema";
import { BaseSchema } from "./base.schema";
import { User } from "./user.schema";
import { OrderTransaction } from "@app/schemas/order-transaction.schema";

@Schema({ timestamps: true })
export class Order extends BaseSchema {
  @Prop({ type: mongoose.Types.ObjectId, ref: "User", required: false })
  user?: User;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop()
  addressCode: [number, number, number];

  @Prop({ type: [{ type: Types.ObjectId }], ref: "OrderItem" })
  items: OrderItem[];

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: String, enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Prop({ type: Types.ObjectId, ref: "OrderTransaction" })
  transaction: OrderTransaction;

  @Prop({ default: 0 })
  shippingCost: number;

  @Prop({ default: 0 })
  totalCost: number;

  @Prop({ default: 0 })
  discountCost: number;

  @Prop({ type: Date })
  createAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
