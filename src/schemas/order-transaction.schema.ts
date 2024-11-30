import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { TransactionStatus } from "@app/enums";
import { BaseSchema } from "@app/schemas/base.schema";

@Schema({ timestamps: true })
export class OrderTransaction extends BaseSchema {
  @Prop({ type: Date, required: false, default: undefined })
  payDate: Date;

  @Prop({ type: Number, required: true, default: 0 })
  amount: number;

  @Prop({ type: String, required: true, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const OrderTransactionSchema = SchemaFactory.createForClass(OrderTransaction);
