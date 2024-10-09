import { WsException } from "@nestjs/websockets";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { Model, Types } from "mongoose";

import { CreateRatingPayload, PaginationResponse } from "@app/models";
import { ErrorMessage, OrderStatus } from "@app/enums";
import { Order, Rating } from "@app/schemas";

@Injectable()
export class RatingService {
  constructor(
    @InjectModel(Rating.name) private readonly ratingModel: Model<Rating>,
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
  ) {}

  async hasPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const orders: number = await this.orderModel
      .countDocuments({
        user: new Types.ObjectId(userId),
        items: {
          $elemMatch: { product: new Types.ObjectId(productId) },
        },
        status: OrderStatus.COMPLETED,
      })
      .exec();

    return orders > 0;
  }

  async addComment(userId: string, payload: CreateRatingPayload) {
    const { productId, rating, comment } = payload;

    const hasPurchased = await this.hasPurchasedProduct(userId, productId);
    if (!hasPurchased) {
      throw new WsException(ErrorMessage.REQUIRE_PURCHASE);
    }

    const newRating = await this.ratingModel.create({ user: userId, product: productId, rating, comment });

    return newRating;
  }

  async getRatingsByProductId(productId: string, pagination: Pagination): Promise<PaginationResponse<Rating>> {
    const { limit, page } = pagination;

    const totalRatings = await this.ratingModel.countDocuments({ product: productId }).exec();
    const totalPages = Math.ceil(totalRatings / limit);

    const ratings = await this.ratingModel
      .find({ product: productId })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const response: PaginationResponse<Rating> = {
      meta: {
        pages: totalPages,
        page,
        limit,
      },
      data: ratings,
    };

    return response;
  }
}
