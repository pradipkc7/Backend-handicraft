import { OrderService } from "../services/order.service.ts";
import { HttpException } from "../exceptions/http-exception.ts";
import { z } from "zod";
import * as OrderDto from "../dtos/order.dto.ts";
import { ApiResponseHelper } from "../utils/apihelper.util.ts";
import { Request, Response } from "express";

const orderService = new OrderService();

export class OrderController {
  async createOrder(req: Request, res: Response) {
    try {
      const parseResult = OrderDto.CreateOrderDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const buyerId = (req.user as any)._id.toString();
      const result = await orderService.createOrder(buyerId, parseResult.data);
      return ApiResponseHelper.success(res, result, "Order created", 201);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to create order",
        e.status || 500,
      );
    }
  }

  async verifyPayment(req: Request, res: Response) {
    try {
      const pidx = (req.query.pidx as string) || req.body.pidx;
      if (!pidx) {
        throw new HttpException(400, "pidx is required");
      }
      const order = await orderService.verifyPayment(pidx);
      return ApiResponseHelper.success(res, order, "Payment verified", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to verify payment",
        e.status || 500,
      );
    }
  }

  async getMyOrders(req: Request, res: Response) {
    try {
      const buyerId = (req.user as any)._id.toString();
      const orders = await orderService.getOrdersByBuyer(buyerId);
      return ApiResponseHelper.success(res, orders, "Orders fetched", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to fetch orders",
        e.status || 500,
      );
    }
  }

  async getOrderById(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id.toString();
      const order = await orderService.getOrderById(
        req.params.id as string,
        userId,
      );
      return ApiResponseHelper.success(res, order, "Order fetched", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to fetch order",
        e.status || 500,
      );
    }
  }

  async updateStatus(req: Request, res: Response) {
    try {
      const parseResult = OrderDto.UpdateOrderStatusDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const userId = (req.user as any)._id.toString();
      const order = await orderService.updateStatus(
        req.params.id as string,
        userId,
        parseResult.data.status,
      );
      return ApiResponseHelper.success(res, order, "Order status updated", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to update order status",
        e.status || 500,
      );
    }
  }
}
