import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { Collection, Cost, Option } from ".";
import { BaseSchema } from "./base.schema";

@Schema({ timestamps: true })
export class Product extends BaseSchema {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  preserveDescription: string;

  @Prop()
  material: string;

  @Prop({ type: Date })
  createAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;

  @Prop({ type: mongoose.Types.ObjectId, ref: "Collection" })
  collection: Collection;

  @Prop({ type: [{ type: mongoose.Types.ObjectId, ref: "Collection" }], ref: "Option" })
  options: Option[];

  @Prop({ type: mongoose.Types.ObjectId, ref: "Cost" })
  cost: Cost;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
