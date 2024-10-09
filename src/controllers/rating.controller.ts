import { Controller, Get, Param } from "@nestjs/common";

import { RatingService } from "@app/services";
import { Auth, AuthUid, Pagination } from "@app/decorators";
import { Rating } from "@app/schemas";
import { ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PaginationResponse } from "@app/models";
import { ProductMessages, RatingMessages } from "@app/enums";

@Controller("rating")
@ApiTags("rating")
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get("/check/:pid")
  @Auth()
  @ApiParam({ name: "pid", required: true, description: ProductMessages.PRODUCT_ID, type: String })
  @ApiResponse({
    status: 200,
    description: RatingMessages.RATABLE,
    type: PaginationResponse<Rating>,
  })
  async checkRatable(@AuthUid() userId: string, @Param("pid") productId: string): Promise<boolean> {
    return this.ratingService.hasPurchasedProduct(userId, productId);
  }

  @Get("/:pid")
  @ApiParam({ name: "pid", required: true, description: ProductMessages.PRODUCT_ID, type: String })
  @ApiResponse({
    status: 200,
    description: RatingMessages.GET_RATINGS_SUCCESS,
    type: PaginationResponse<Rating>,
  })
  @ApiResponse({
    status: 404,
    description: RatingMessages.PRODUCT_NOT_FOUND,
  })
  async getRatings(
    @Param("pid") productId: string,
    @Pagination() pagination: Pagination,
  ): Promise<PaginationResponse<Rating>> {
    return this.ratingService.getRatingsByProductId(productId, pagination);
  }
}
