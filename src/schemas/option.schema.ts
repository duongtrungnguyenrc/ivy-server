import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "./base.schema";
import { Size } from "@app/enums";

@Schema()
export class Option extends BaseSchema {
  @Prop()
  colorHexCode: string;

  @Prop()
  colorName: string;

  @Prop({ type: String, enum: Size })
  size: Size;

  @Prop({ default: 0 })
  stock: number;
}

export const OptionSchema = SchemaFactory.createForClass(Option);
