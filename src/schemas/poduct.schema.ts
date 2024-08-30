import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { BaseSchema } from "./base.schema";
import { Collection, Cost } from ".";

@Schema()
export class Product extends BaseSchema {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ default: 0 })
  quantity: number;

  @Prop()
  preserveDescription: string;

  @Prop()
  material: string;

  @Prop({ type: mongoose.Types.ObjectId, ref: "Collection" })
  collection: Collection;

  @Prop({ type: mongoose.Types.ObjectId, ref: "Cost" })
  cost: Cost;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
