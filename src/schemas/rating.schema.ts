import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { BaseSchema } from "./base.schema";
import { Product } from "./product.schema";
import { User } from "./user.schema";

@Schema()
export class Rating extends BaseSchema {
  @Prop({ type: mongoose.Types.ObjectId, ref: "User" })
  user: User;

  @Prop({ type: mongoose.Types.ObjectId, ref: "Product" })
  product: Product;

  @Prop()
  rating: number;

  @Prop({ default: "", required: false })
  comment?: string;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
