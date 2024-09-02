import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";

@Schema()
export class Option extends BaseSchema {
  @Prop()
  colorHexCode: string;

  @Prop()
  images: string[];
}

export const OptionSchema = SchemaFactory.createForClass(Option);
