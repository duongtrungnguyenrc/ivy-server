import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { isValidObjectId, Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { CreateProductPayload, PaginationResponse, TopProductsResponse, UpdateProductPayload } from "@app/models";
import { ProductOptionService } from "@app/services/product-option.service";
import { NOT_DELETED_FILTER, PRODUCT_CACHE_PREFIX } from "@app/constants";
import { CollectionService } from "@app/services/collection.service";
import { RepositoryService } from "@app/services/repository.service";
import { Collection, Cost, Option, Product } from "@app/schemas";
import { CacheService } from "@app/services/cache.service";
import { CostService } from "@app/services/cost.service";
import { CategoryService } from "./category.service";
import { withMutateTransaction } from "@app/utils";
import { ErrorMessage } from "@app/enums";

@Injectable()
export class ProductService extends RepositoryService<Product> {
  constructor(
    private readonly costService: CostService,
    private readonly productOptionService: ProductOptionService,
    private readonly collectionService: CollectionService,
    private readonly categoryService: CategoryService,
    @InjectModel(Product.name)
    productModel: Model<Product>,
    cacheService: CacheService,
  ) {
    super(productModel, cacheService, PRODUCT_CACHE_PREFIX);
  }

  async searchProduct(query: string): Promise<Product[]> {
    const filters = [];

    filters.push({ name: { $regex: query, $options: "i" } });

    if (Types.ObjectId.isValid(query)) {
      filters.push({ _id: new Types.ObjectId(query) });
    }

    return await this.findMultiple({ $or: filters }, ["_id", "name", "images", "description"]);
  }

  async getProductDetail(id: string): Promise<Product> {
    const product: Product = await this.find(id, undefined, [
      "currentCost",
      {
        path: "options",
        model: "Option",
        match: { isDeleted: false },
      },
    ]);

    if (!product) throw new BadRequestException(ErrorMessage.PRODUCT_NOT_FOUND);

    return product;
  }

  async getProductsByCollection(id: string, pagination: Pagination): Promise<PaginationResponse<Product>> {
    const collection: Collection = await this.collectionService.find(id, ["products"]);

    if (!collection) {
      throw new BadRequestException(ErrorMessage.COLLECTION_NOT_FOUND);
    }

    return this.findMultiplePaging(
      {
        $and: [{ _id: { $in: collection.products } }, NOT_DELETED_FILTER],
      },
      pagination,
      undefined,
      ["options", "currentCost"],
    );
  }

  async getTopProductsByCategory(limit: number = 5): Promise<TopProductsResponse[]> {
    return this.categoryService._model
      .aggregate()
      .lookup({
        from: "collectiongroups",
        localField: "collectionGroups",
        foreignField: "_id",
        as: "collectionGroupsData",
      })
      .unwind("collectionGroupsData")
      .lookup({
        from: "collections",
        localField: "collectionGroupsData.collections",
        foreignField: "_id",
        as: "collectionsData",
      })
      .unwind("collectionsData")
      .lookup({
        from: "products",
        localField: "collectionsData.products",
        foreignField: "_id",
        as: "productsData",
      })
      .unwind("productsData")
      .lookup({
        from: "costs",
        localField: "productsData.currentCost",
        foreignField: "_id",
        as: "currentCostData",
      })
      .addFields({
        "productsData.currentCost": { $arrayElemAt: ["$currentCostData", 0] },
      })
      .lookup({
        from: "options",
        localField: "productsData.options",
        foreignField: "_id",
        as: "optionsData",
      })
      .addFields({
        "productsData.options": "$optionsData",
      })
      .project({
        "productsData.costs": 0,
      })
      .lookup({
        from: "orderitems",
        localField: "productsData._id",
        foreignField: "product",
        as: "orderItemsData",
      })
      .unwind({
        path: "$orderItemsData",
        preserveNullAndEmptyArrays: true,
      })
      .group({
        _id: {
          category: "$name",
          product: "$productsData._id",
        },
        productName: { $first: "$productsData.name" },
        totalSold: { $sum: "$orderItemsData.quantity" },
        currentCost: { $first: "$productsData.currentCost" },
        options: { $first: "$productsData.options" },
        images: {
          $first: "$productsData.images",
        },
      })
      .sort({
        "_id.category": 1,
        totalSold: -1,
      })
      .group({
        _id: "$_id.category",
        topProducts: {
          $push: {
            _id: "$_id.product",
            name: "$productName",
            totalSold: "$totalSold",
            currentCost: "$currentCost",
            options: "$options",
            images: "$images",
          },
        },
      })
      .project({
        category: "$_id",
        topProducts: { $slice: ["$topProducts", limit] },
      });
  }

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    return withMutateTransaction<Product>(this._model, async (session) => {
      const { options, cost, collectionId, ...product } = payload;
      const createdCost = await this.costService.create([cost], { session });
      const createdOptions = await this.productOptionService.create(options, { session });

      const createProductPayload = {
        ...product,
        options: createdOptions.map((option) => new Types.ObjectId(option._id)),
        currentCost: new Types.ObjectId(createdCost[0]._id),
        costs: [new Types.ObjectId(createdCost[0]._id)],
      };

      const [createdProduct] = await this.create([createProductPayload], { session });

      await this.collectionService.update(
        collectionId,
        {
          $push: {
            products: createdProduct._id,
          },
        },
        { session },
      );

      return createdProduct;
    });
  }

  async updateProduct(productId: string, updateData: UpdateProductPayload): Promise<Product> {
    return await withMutateTransaction(this._model, async (session) => {
      const product = await this._model.findById(productId).session(session);

      if (!product) {
        throw new BadRequestException(ErrorMessage.PRODUCT_NOT_FOUND);
      }

      const { newOptions, updateOptions, deleteOptions, newImages, deleteImages, newCost, ...updates } = updateData;
      const pullUpdate = new Map<keyof Product, Array<any>>();
      const pushUpdate = new Map<keyof Product, Array<any>>();
      const parallelCallStack = new Map<string, Promise<any>>();

      if (newCost) {
        const createCostTask = this.costService.create([newCost], { session });
        parallelCallStack.set("createCost", createCostTask);
      }

      if (newOptions) {
        const createOptionsTask: Promise<Array<Option>> = this.productOptionService.create(newOptions, { session });
        parallelCallStack.set("createOptions", createOptionsTask);
      }

      if (updateOptions) {
        const updateOptionsTask = Promise.all(
          updateOptions.map(({ _id, ...updates }) => {
            return this.productOptionService.update(_id, updates, { session });
          }),
        );

        parallelCallStack.set("updateOptions", updateOptionsTask);
      }

      if (deleteOptions) {
        const deleteOptionsTask = Promise.all(
          deleteOptions.map((id) => {
            if (isValidObjectId(id)) this.productOptionService.safeDelete(id);
          }),
        );

        parallelCallStack.set("deleteOptions", deleteOptionsTask);
      }

      if (newImages) {
        pushUpdate.set("images", newImages);
      }

      if (deleteImages) {
        pullUpdate.set("images", deleteImages);
      }

      const parallelResults = await Promise.all(parallelCallStack.values());
      const parallelCallStackTaskKeys = Array.from(parallelCallStack.keys());

      if (newCost) {
        const [createdCost]: Array<Cost> = parallelResults[parallelCallStackTaskKeys.indexOf("createCost")];
        pushUpdate.set("costs", [createdCost._id]);

        Object.assign(updates, {
          currentCost: createdCost._id,
        });
      }

      if (newOptions) {
        const createdOptions: Array<Option> = parallelResults[parallelCallStackTaskKeys.indexOf("createOptions")];
        pushUpdate.set(
          "options",
          createdOptions.map((option: Option) => option._id),
        );
      }

      const pushObject = Object.fromEntries(
        Array.from(pushUpdate.entries()).map(([key, value]) => [key, { $each: value }]),
      );

      const pullObject = Object.fromEntries(
        Array.from(pullUpdate.entries()).map(([key, value]) => [key, { $in: value }]),
      );

      return this.update(
        productId,
        {
          ...updates,
          $push: pushObject,
          $pull: pullObject,
        },
        { session },
      );
    });
  }

  async safeDeleteProduct(id: string): Promise<void> {
    const deleteResult = await this.safeDelete(id);

    if (!deleteResult) {
      throw new BadRequestException(ErrorMessage.PRODUCT_NOT_FOUND);
    }
  }

  async checkProductAndOptionExist(productId: string, optionId: string): Promise<boolean> {
    const productExists = await this.exists({ _id: new Types.ObjectId(productId) });
    if (!productExists) {
      throw new NotFoundException(ErrorMessage.PRODUCT_NOT_FOUND);
    }

    const optionExists = await this.productOptionService.exists({
      _id: new Types.ObjectId(optionId),
    });
    if (!optionExists) {
      throw new NotFoundException(ErrorMessage.PRODUCT_OPTION_NOT_FOUND);
    }

    return true;
  }
}
