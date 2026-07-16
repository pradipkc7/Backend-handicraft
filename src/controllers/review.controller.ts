import { ReviewService } from "../services/review.service.ts";
import { HttpException } from "../exceptions/http-exception.ts";
import { z } from "zod";
import * as ReviewDto from "../dtos/review.dto.ts";
import { ApiResponseHelper } from "../utils/apihelper.util.ts";
import { Request, Response } from "express";

const reviewService = new ReviewService();

export class ReviewController {
  async createReview(req: Request, res: Response) {
    try {
      const parseResult = ReviewDto.CreateReviewDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const userId = (req.user as any)._id.toString();
      const review = await reviewService.createReview(
        req.params.id as string,
        userId,
        parseResult.data,
      );
      return ApiResponseHelper.success(res, review, "Review created", 201);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to create review",
        e.status || 500,
      );
    }
  }

  async getReviewsByItem(req: Request, res: Response) {
    try {
      const reviews = await reviewService.getReviewsByItem(
        req.params.id as string,
      );
      return ApiResponseHelper.success(
        res,
        reviews,
        "Reviews fetched successfully",
        200,
      );
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to fetch reviews",
        e.status || 500,
      );
    }
  }
}
