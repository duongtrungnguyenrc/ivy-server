import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateQuery } from "mongoose";
import { Cache } from "@nestjs/cache-manager";

import { CreateProductPayload, GetProductsByCollectionResponse, UpdateProductPayload } from "@app/models";
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

  async getProductsByCollection(id: string, page: number, limit: number): Promise<GetProductsByCollectionResponse> {
    const collection: Collection = await this.collectionService.findCollectionById(id);

    if (!collection) {
      throw new BadRequestException(`Danh mục không tồn tại`);
    }

    const skip = (page - 1) * limit;

    const totalProducts = await this.productModel.countDocuments({
      collection: collection._id,
      isDeleted: false,
    });

    const totalPages = Math.ceil(totalProducts / limit);

    const products = await this.productModel
      .find({
        collection: collection._id,
        isDeleted: false,
      })
      .skip(skip)
      .limit(limit)
      .populate(["currentCost", "options"])
      .exec();

    const responseData: GetProductsByCollectionResponse = {
      products: products,
      page: page,
      limit: limit,
      totalPages: totalPages,
    };

    return responseData;
  }

  async createProduct(payload: CreateProductPayload): Promise<Product> {
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
      options: createdOptions,
      currentCost: createdCost,
      costs: [createdCost],
    };

    const createdProduct: Product = await this.productModel.create(createProducePayload);

    return createdProduct;
  }

  async updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
    const { options, cost, collectionId, ...product } = payload;

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

    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    const updatedProduct: Product = await this.productModel.findByIdAndUpdate(id, {
      isDeleted: true,
    });

    if (!updatedProduct) {
      throw new BadRequestException("Sản phẩm không tồn tại");
    }
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
