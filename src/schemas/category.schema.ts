import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

import { CollectionGroup } from "./collection-group.schema";
import { BaseSchema } from "./base.schema";

@Schema({ timestamps: true })
export class Category extends BaseSchema {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: false })
  isSpecial: boolean;

  @Prop({ type: [{ type: Types.ObjectId }], ref: "CollectionGroup", default: [] })
  collectionGroups: CollectionGroup[];

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
