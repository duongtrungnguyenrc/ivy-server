import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { Collection } from "./collection.schema";
import { ProductCategory } from "@app/enums";
import { BaseSchema } from "./base.schema";

@Schema({ timestamps: true })
export class Group extends BaseSchema {
  @Prop({ type: String, enum: ProductCategory })
  category: ProductCategory;

  @Prop({ unique: true })
  name: string;

  @Prop({ default: false })
  special: boolean;

  @Prop({ type: [{ type: mongoose.Types.ObjectId }], ref: "Collection", default: [] })
  collections: Collection[];

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
