import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { Cost, Option } from ".";
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

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: [{ type: mongoose.Types.ObjectId }], ref: "Option" })
  options: Option[];

  @Prop()
  images: string[];

  @Prop({ type: mongoose.Types.ObjectId, ref: "Cost" })
  currentCost: Cost;

  @Prop({ type: [{ type: mongoose.Types.ObjectId }], ref: "Cost", default: [] })
  costs: Cost[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
