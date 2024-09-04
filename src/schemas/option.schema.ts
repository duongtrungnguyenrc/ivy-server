import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";

@Schema()
export class Option extends BaseSchema {
  @Prop()
  colorHexCode: string;

  @Prop()
  colorName: string;

  @Prop()
  images: string[];

  @Prop({ default: 0 })
  stock: number;
}

export const OptionSchema = SchemaFactory.createForClass(Option);
