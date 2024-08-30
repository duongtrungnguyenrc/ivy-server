import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { BaseSchema } from "./base.schema";

@Schema()
export class Cost extends BaseSchema {
  @Prop()
  ingredientPrice: number;

  @Prop()
  production_cost: number;

  @Prop()
  sale_cost: number;

  @Prop()
  discountPercentage: number;
}

export const CostSchema = SchemaFactory.createForClass(Cost);
