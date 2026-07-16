import { ReviewModel, IReview } from "../models/review.model.js";

export interface IReviewRepository {
  createReview(review: Partial<IReview>): Promise<IReview>;
  getReviewsByItem(itemId: string): Promise<IReview[]>;
  getReviewByUserAndItem(
    itemId: string,
    userId: string,
  ): Promise<IReview | null>;
}

export class ReviewMongoRepository implements IReviewRepository {
  async createReview(review: Partial<IReview>): Promise<IReview> {
    const created = await ReviewModel.create(review);
    return created;
  }
  async getReviewsByItem(itemId: string): Promise<IReview[]> {
    const found = await ReviewModel.find({ itemId }).sort({ createdAt: -1 });
    return found;
  }
  async getReviewByUserAndItem(
    itemId: string,
    userId: string,
  ): Promise<IReview | null> {
    const found = await ReviewModel.findOne({ itemId, userId });
    return found;
  }
}
