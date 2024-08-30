import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { ProductType } from "@app/data";
import { BaseSchema } from "./base.schema";

@Schema()
export class Collection extends BaseSchema {
  @Prop({ type: String, enum: ProductType })
  gender: ProductType;

  @Prop()
  name: string;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
