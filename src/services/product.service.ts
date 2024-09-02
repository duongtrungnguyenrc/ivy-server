import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  CreateProductPayload,
  CreateProductResponse,
  DeleteProductPayload,
  DeleteProductResponse,
  UpdateProductPayload,
  UpdateProductResponse,
} from "@app/models";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Collection, Cost, Option, Product } from "@app/schemas";
import { CollectionService } from "./collection.service";

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<Product>,
    @InjectModel(Option.name)
    private readonly optionModel: Model<Option>,
    @InjectModel(Cost.name)
    private readonly costModel: Model<Cost>,
    private readonly collectionService: CollectionService,
  ) {}

  getNewProducts() {}

  getBestSellerProducts() {}

  getProductDetail() {}

  getProductsByCategory() {}

  async createProduct(payload: CreateProductPayload): Promise<CreateProductResponse> {
    const { options, cost, collectionId, ...product } = payload;

    const collectionQuery: Promise<Collection> = this.collectionService.findCollectionById(collectionId);

    const createCostQuery: Promise<Cost> = this.costModel.create(cost);

    const createOptionsQuery: Promise<Option[]> = this.optionModel.create(options);

    const [collection, createdCost, createdOptions] = await Promise.all([
      collectionQuery,
      createCostQuery,
      createOptionsQuery,
    ]).catch((error) => {
      throw new InternalServerErrorException(error.message);
    });

    if (!collection) {
      throw new BadRequestException("Invalid collection");
    }

    const createProducePayload: Partial<Product> = {
      ...product,
      collection: collection,
      cost: createdCost,
      options: createdOptions,
    };

    const createdProduct: Product = await this.productModel.create(createProducePayload);

    const response: CreateProductResponse = {
      data: createdProduct,
      message: "Create product success",
    };

    return response;
  }

  async updateProduct(payload: UpdateProductPayload): Promise<UpdateProductResponse> {
    const { options, cost, collectionId, ...product } = payload;

    const collectionQuery: Promise<Collection> = this.collectionService.findCollectionById(collectionId);

    const updateCostQuery: Promise<Cost> = this.costModel.findByIdAndUpdate(cost.id, cost);

    const updateOptionsQuery: Promise<Option[]> = Promise.all(
      options.map(async ({ id, ...option }) => {
        const existedOption: Option = await this.optionModel.findByIdAndUpdate(id, option);

        if (!existedOption) {
          return await this.optionModel.create(option);
        }

        return existedOption;
      }),
    );

    const [collection, updatedCost, updatedOptions] = await Promise.all([
      collectionQuery,
      updateCostQuery,
      updateOptionsQuery,
    ]).catch((error) => {
      throw new InternalServerErrorException(error.message);
    });

    if (!collection) {
      throw new BadRequestException("Invalid collection");
    }

    const updateProducePayload: Partial<Product> = {
      ...product,
      collection: collection,
      cost: updatedCost,
      options: updatedOptions,
    };

    const updatedProduct: Product = await this.productModel.findByIdAndUpdate(updateProducePayload);

    const response: UpdateProductResponse = {
      data: updatedProduct,
      message: "Update product success",
    };

    return response;
  }

  async deleteProduct(payload: DeleteProductPayload): Promise<DeleteProductResponse> {
    return;
  }
}
