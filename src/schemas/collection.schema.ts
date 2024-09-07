import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { BaseSchema } from "./base.schema";
import { Product } from "./product.schema";
import { Types } from "mongoose";

@Schema({ timestamps: true })
export class Collection extends BaseSchema {
  @Prop()
  name: string;

  @Prop({ type: [{ type: Types.ObjectId }], ref: "Product", default: [] })
  products: Product[];

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
