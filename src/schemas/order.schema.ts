import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { OrderStatus, PaymentMethod } from "@app/enums";
import { OrderItem } from "./order-item.schema";
import { BaseSchema } from "./base.schema";
import { User } from "./user.schema";

@Schema({ timestamps: true })
export class Order extends BaseSchema {
  @Prop({ type: mongoose.Types.ObjectId, ref: "User", required: false })
  user?: User;

  @Prop()
  name: string;

  @Prop()
  email?: string;

  @Prop()
  phone: string;

  @Prop()
  address: string;

  @Prop({ type: [{ type: mongoose.Types.ObjectId }], ref: "OrderItem" })
  items: OrderItem[];

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: String, enum: PaymentMethod, default: PaymentMethod.CASH })
  paymentMethod: PaymentMethod;

  @Prop({ default: 0 })
  shippingCost: number;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
