import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { CreateProductDTO, UpdateProductDTO } from "../dtos/product.dto";
import { ProductService } from "../services/product.service";

const productService = new ProductService();

export class ProductController {
  async createProduct(req: Request, res: Response) {
    try {
      const parseResult = CreateProductDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }

      const createdProduct = await productService.createProduct(
        parseResult.data,
      );
      return ApiResponseHelper.success(
        res,
        createdProduct,
        "Product created successfully",
        201,
      );
    } catch (error: Error | any | unknown) {
      return ApiResponseHelper.error(
        res,
        error?.message || "Failed to create product",
        error?.status || 500,
      );
    }
  }

  async getProducts(req: Request, res: Response) {
    try {
      const { page, limit, search, category, featured } = req.query as any;
      const result = await productService.getProducts(
        page,
        limit,
        search,
        category,
        featured,
      );
      return ApiResponseHelper.success(
        res,
        result.data,
        "Products retrieved successfully",
        200,
        result.pagination,
      );
    } catch (error: Error | any | unknown) {
      return ApiResponseHelper.error(
        res,
        error?.message || "Failed to fetch products",
        error?.status || 500,
      );
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const productId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const product = await productService.getProductById(productId);
      return ApiResponseHelper.success(
        res,
        product,
        "Product retrieved successfully",
      );
    } catch (error: Error | any | unknown) {
      return ApiResponseHelper.error(
        res,
        error?.message || "Failed to fetch product",
        error?.status || 500,
      );
    }
  }

  async getFeaturedProducts(req: Request, res: Response) {
    try {
      const limit = Number(req.query.limit || 6);
      const products = await productService.getFeaturedProducts(limit);
      return ApiResponseHelper.success(
        res,
        products,
        "Featured products retrieved successfully",
      );
    } catch (error: Error | any | unknown) {
      return ApiResponseHelper.error(
        res,
        error?.message || "Failed to fetch featured products",
        error?.status || 500,
      );
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await productService.getCategories();
      return ApiResponseHelper.success(
        res,
        categories,
        "Categories retrieved successfully",
      );
    } catch (error: Error | any | unknown) {
      return ApiResponseHelper.error(
        res,
        error?.message || "Failed to fetch categories",
        error?.status || 500,
      );
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const parseResult = UpdateProductDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }

      const productId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const updatedProduct = await productService.updateProduct(
        productId,
        parseResult.data,
      );
      return ApiResponseHelper.success(
        res,
        updatedProduct,
        "Product updated successfully",
      );
    } catch (error: Error | any | unknown) {
      return ApiResponseHelper.error(
        res,
        error?.message || "Failed to update product",
        error?.status || 500,
      );
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const productId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const deleted = await productService.deleteProduct(productId);
      if (!deleted) {
        return ApiResponseHelper.error(res, "Product not found", 404);
      }
      return ApiResponseHelper.success(
        res,
        null,
        "Product deleted successfully",
      );
    } catch (error: Error | any | unknown) {
      return ApiResponseHelper.error(
        res,
        error?.message || "Failed to delete product",
        error?.status || 500,
      );
    }
  }
}
