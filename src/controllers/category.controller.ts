import { CategoryService } from "../services/category.service.ts";
import { HttpException } from "../exceptions/http-exception.ts";
import { z } from "zod";
import * as CategoryDto from "../dtos/category.dto.ts";
import { ApiResponseHelper } from "../utils/apihelper.util.ts";
import { Request, Response } from "express";

const categoryService = new CategoryService();

export class CategoryController {
  async createCategory(req: Request, res: Response) {
    try {
      const parseResult = CategoryDto.CreateCategoryDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const created = await categoryService.createCategory(parseResult.data);
      return ApiResponseHelper.success(res, created, "Category created", 201);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to create category",
        e.status || 500,
      );
    }
  }

  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await categoryService.getAllCategories();
      return ApiResponseHelper.success(
        res,
        categories,
        "Categories fetched successfully",
        200,
      );
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to fetch categories",
        e.status || 500,
      );
    }
  }

  async getCategoryById(req: Request, res: Response) {
    try {
      const category = await categoryService.getCategoryById(
        req.params.id as string,
      );
      return ApiResponseHelper.success(
        res,
        category,
        "Category fetched successfully",
        200,
      );
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to fetch category",
        e.status || 500,
      );
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const parseResult = CategoryDto.UpdateCategoryDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const updated = await categoryService.updateCategory(
        req.params.id as string,
        parseResult.data,
      );
      return ApiResponseHelper.success(res, updated, "Category updated", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to update category",
        e.status || 500,
      );
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      await categoryService.deleteCategory(req.params.id as string);
      return ApiResponseHelper.success(res, null, "Category deleted", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to delete category",
        e.status || 500,
      );
    }
  }
}
