import { ItemService } from "../services/item.service.ts";
import { HttpException } from "../exceptions/http-exception.ts";
import { z } from "zod";
import * as ItemDto from "../dtos/item.dto.ts";
import { ApiResponseHelper } from "../utils/apihelper.util.ts";
import { Request, Response } from "express";

const itemService = new ItemService();

export class ItemController {
  async createItem(req: Request, res: Response) {
    try {
      const parseResult = ItemDto.CreateItemDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const sellerId = (req.user as any)._id.toString();
      const created = await itemService.createItem(parseResult.data, sellerId);
      return ApiResponseHelper.success(res, created, "Item created", 201);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to create item",
        e.status || 500,
      );
    }
  }

  async getAllItems(req: Request, res: Response) {
    try {
      const { categoryId, sellerId, status } = req.query;
      const items = await itemService.getAllItems({
        categoryId: categoryId as string | undefined,
        sellerId: sellerId as string | undefined,
        status: status as string | undefined,
      });
      return ApiResponseHelper.success(
        res,
        items,
        "Items fetched successfully",
        200,
      );
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to fetch items",
        e.status || 500,
      );
    }
  }

  async getItemById(req: Request, res: Response) {
    try {
      const item = await itemService.getItemById(req.params.id as string);
      return ApiResponseHelper.success(
        res,
        item,
        "Item fetched successfully",
        200,
      );
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to fetch item",
        e.status || 500,
      );
    }
  }

  async updateItem(req: Request, res: Response) {
    try {
      const parseResult = ItemDto.UpdateItemDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const userId = (req.user as any)._id.toString();
      const updated = await itemService.updateItem(
        req.params.id as string,
        userId,
        parseResult.data,
      );
      return ApiResponseHelper.success(res, updated, "Item updated", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to update item",
        e.status || 500,
      );
    }
  }

  async deleteItem(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id.toString();
      await itemService.deleteItem(req.params.id as string, userId);
      return ApiResponseHelper.success(res, null, "Item deleted", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to delete item",
        e.status || 500,
      );
    }
  }

  async claimItem(req: Request, res: Response) {
    try {
      const buyerId = (req.user as any)._id.toString();
      const claimed = await itemService.claimItem(
        req.params.id as string,
        buyerId,
      );
      return ApiResponseHelper.success(res, claimed, "Item claimed", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to claim item",
        e.status || 500,
      );
    }
  }

  async uploadPhoto(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw new HttpException(400, "No photo uploaded");
      }
      return ApiResponseHelper.success(
        res,
        `/uploads/${req.file.filename}`,
        "Photo uploaded",
        200,
      );
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to upload photo",
        e.status || 500,
      );
    }
  }

  async uploadVideo(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw new HttpException(400, "No video uploaded");
      }
      return ApiResponseHelper.success(
        res,
        `/uploads/${req.file.filename}`,
        "Video uploaded",
        200,
      );
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to upload video",
        e.status || 500,
      );
    }
  }
}
