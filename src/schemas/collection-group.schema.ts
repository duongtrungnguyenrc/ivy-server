import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

import { Collection } from "./collection.schema";
import { BaseSchema } from "./base.schema";

@Schema({ timestamps: true })
export class CollectionGroup extends BaseSchema {
  @Prop()
  name: string;

  @Prop({ default: false })
  isSpecial: boolean;

  @Prop({ type: [{ type: mongoose.Types.ObjectId }], ref: "Collection", default: [] })
  collections: Collection[];

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const CollectionGroupSchema = SchemaFactory.createForClass(CollectionGroup);
