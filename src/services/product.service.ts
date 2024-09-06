import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, UpdateQuery } from "mongoose";
import { Cache } from "@nestjs/cache-manager";

import {
  CreateProductPayload,
  CreateProductResponse,
  DeleteProductResponse,
  UpdateProductPayload,
  UpdateProductResponse,
} from "@app/models";
import { PRODUCT_CACHE_PREFIX, PRODUCT_OPTION_CACHE_PREFIX } from "@app/constants";
import { Collection, Cost, Option, Product } from "@app/schemas";
import { CollectionService } from "./collection.service";
import { joinCacheKey } from "@app/utils";

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
    private readonly cacheManager: Cache,
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

    const createProducePayload: UpdateQuery<Product> = {
      ...product,
      collection: collection,
      options: createdOptions.map(({ _id }) => new mongoose.Types.ObjectId(_id)),
      currentCost: new mongoose.Types.ObjectId(createdCost._id),
      $push: {
        costs: createdCost,
      },
    };

    const createdProduct: Product = await this.productModel.create(createProducePayload);

    const response: CreateProductResponse = {
      data: createdProduct,
      message: "Create product success",
    };

    return response;
  }

  async updateProduct(payload: UpdateProductPayload): Promise<UpdateProductResponse> {
    const { options, cost, collectionId, id, ...product } = payload;

    const collectionQuery: Promise<Collection> = this.collectionService.findCollectionById(collectionId);

    const createCostQuery: Promise<Cost> = this.costModel.create(cost);

    const updateOptionsQuery: Promise<Option[]> = Promise.all(
      options.map(async ({ id, ...option }) => {
        const existedOption: Option = await this.optionModel.findByIdAndUpdate(id, option);

        if (!existedOption) {
          return await this.optionModel.create(option);
        }

        return existedOption;
      }),
    );

    const [collection, newCost, updatedOptions] = await Promise.all([
      collectionQuery,
      createCostQuery,
      updateOptionsQuery,
    ]).catch((error) => {
      throw new InternalServerErrorException(error.message);
    });

    if (!collection) {
      throw new BadRequestException("Invalid collection");
    }

    const updateProductPayload: UpdateQuery<Product> = {
      ...product,
      collection: collection,
      options: updatedOptions,
      currentCost: newCost,
      $push: {
        costs: newCost,
      },
    };

    const updatedProduct: Product = await this.productModel.findByIdAndUpdate(id, updateProductPayload);

    this.cacheManager.del(joinCacheKey(PRODUCT_CACHE_PREFIX, id));

    const response: UpdateProductResponse = {
      data: updatedProduct,
      message: "Update product success",
    };

    return response;
  }

  async deleteProduct(id: string): Promise<DeleteProductResponse> {
    return;
  }

  async updateProductOptionById(id: string, update: UpdateQuery<Option>, raw: boolean = false): Promise<Option> {
    const option: Option = await this.optionModel.findByIdAndUpdate(
      id,
      {
        ...update,
      },
      { new: true },
    );

    if (!option && !raw) {
      throw new Error("Product option not found");
    }

    return option;
  }

  async findProductById(id: string, populate: (keyof Product)[] = [], raw: boolean = false): Promise<Product> {
    const productCacheKey: string = joinCacheKey(PRODUCT_CACHE_PREFIX, id);
    const cachedProduct: Product = await this.cacheManager.get(productCacheKey);

    if (cachedProduct) return cachedProduct;

    const product: Product = await this.productModel.findById(id).populate(populate);

    if (!product && !raw) {
      throw new BadRequestException("Product not found");
    }

    this.cacheManager.set(productCacheKey, product);

    return product;
  }

  async findProductOptionById(id: string, raw: boolean = false): Promise<Option> {
    const productOptionCacheKey: string = joinCacheKey(PRODUCT_OPTION_CACHE_PREFIX, id);
    const cachedProductOption: Option = await this.cacheManager.get(productOptionCacheKey);

    if (cachedProductOption) return cachedProductOption;

    const option: Option = await this.optionModel.findById(id);

    if (!option && !raw) {
      throw new BadRequestException("Product option not found");
    }

    this.cacheManager.set(productOptionCacheKey, option);

    return option;
  }
}
