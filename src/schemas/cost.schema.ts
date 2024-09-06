import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { BaseSchema } from "./base.schema";

@Schema()
export class Cost extends BaseSchema {
  @Prop()
  ingredientCost: number;

  @Prop()
  productionCost: number;

  @Prop()
  saleCost: number;

  @Prop()
  discountPercentage: number;
}

export const CostSchema = SchemaFactory.createForClass(Cost);
