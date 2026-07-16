import { ReviewMongoRepository } from "../repositories/review.repository";
import { ItemMongoRepository } from "../repositories/item.repository";
import { CreateReviewDTO } from "../dtos/review.dto";
import { IReview } from "../models/review.model";
import { IItem } from "../models/item.model";
import { HttpException } from "../exceptions/http-exception";

const reviewRepository = new ReviewMongoRepository();
const itemRepository = new ItemMongoRepository();

export class ReviewService {
  async createReview(
    itemId: string,
    userId: string,
    data: CreateReviewDTO,
  ): Promise<IReview> {
    const item = await itemRepository.getItemById(itemId);
    if (!item) {
      throw new HttpException(404, "Item not found");
    }
    const existing = await reviewRepository.getReviewByUserAndItem(
      itemId,
      userId,
    );
    if (existing) {
      throw new HttpException(400, "You have already reviewed this item");
    }

    const review = await reviewRepository.createReview({
      itemId: itemId as unknown as IReview["itemId"],
      userId: userId as unknown as IReview["userId"],
      rating: data.rating,
      comment: data.comment,
    });

    const allReviews = await reviewRepository.getReviewsByItem(itemId);
    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await itemRepository.update(itemId, {
      rating: Math.round(averageRating * 10) / 10,
      totalReviews: allReviews.length,
    } as unknown as Partial<IItem>);

    return review;
  }

  async getReviewsByItem(itemId: string): Promise<IReview[]> {
    return reviewRepository.getReviewsByItem(itemId);
  }
}
