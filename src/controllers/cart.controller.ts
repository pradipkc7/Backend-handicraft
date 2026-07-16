import { CartService } from "../services/cart.service.ts";
import { HttpException } from "../exceptions/http-exception.ts";
import { z } from "zod";
import * as CartDto from "../dtos/cart.dto.ts";
import { ApiResponseHelper } from "../utils/apihelper.util.ts";
import { Request, Response } from "express";

const cartService = new CartService();

export class CartController {
  async getCart(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id.toString();
      const cart = await cartService.getCart(userId);
      return ApiResponseHelper.success(res, cart, "Cart fetched successfully", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to fetch cart",
        e.status || 500,
      );
    }
  }

  async addItem(req: Request, res: Response) {
    try {
      const parseResult = CartDto.AddCartItemDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const userId = (req.user as any)._id.toString();
      const cart = await cartService.addItem(userId, parseResult.data);
      return ApiResponseHelper.success(res, cart, "Item added to cart", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to add item to cart",
        e.status || 500,
      );
    }
  }

  async updateItem(req: Request, res: Response) {
    try {
      const parseResult = CartDto.UpdateCartItemDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const userId = (req.user as any)._id.toString();
      const cart = await cartService.updateItem(
        userId,
        req.params.itemId as string,
        parseResult.data,
      );
      return ApiResponseHelper.success(res, cart, "Cart item updated", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to update cart item",
        e.status || 500,
      );
    }
  }

  async removeItem(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id.toString();
      const cart = await cartService.removeItem(
        userId,
        req.params.itemId as string,
      );
      return ApiResponseHelper.success(res, cart, "Item removed from cart", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to remove cart item",
        e.status || 500,
      );
    }
  }

  async clearCart(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id.toString();
      const cart = await cartService.clearCart(userId);
      return ApiResponseHelper.success(res, cart, "Cart cleared", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to clear cart",
        e.status || 500,
      );
    }
  }
}
