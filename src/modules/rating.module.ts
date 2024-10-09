import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";

import { Order, OrderSchema, Rating, RatingSchema } from "@app/schemas";
import { RatingGateway } from "@app/gateways";
import { RatingService } from "@app/services";
import { RatingController } from "@app/controllers";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Rating.name,
        schema: RatingSchema,
      },
      {
        name: Order.name,
        schema: OrderSchema,
      },
    ]),
  ],
  controllers: [RatingController],
  providers: [RatingService, RatingGateway],
})
export class RatingModule {}
