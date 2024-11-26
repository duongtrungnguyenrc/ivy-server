import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";

import { RepositoryService } from "@app/services/repository.service";
import { CartItem } from "@app/schemas";

@Injectable()
export class CartItemService extends RepositoryService<CartItem> {
  constructor(@InjectModel(CartItem.name) cartItemModel: Model<CartItem>) {
    super(cartItemModel);
  }
}
