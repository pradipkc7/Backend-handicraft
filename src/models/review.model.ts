import mongoose, { Schema, Document } from "mongoose";
import { CreateReviewType } from "../types/review.type";

export interface IReview extends CreateReviewType, Document {
  _id: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewMongoSchema: Schema = new Schema<IReview>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: false },
  },
  {
    timestamps: true,
  },
);

// One review per user per item
ReviewMongoSchema.index({ itemId: 1, userId: 1 }, { unique: true });

export const ReviewModel = mongoose.model<IReview>(
  "Review", // db.reviews -> Model Name "Review"
  ReviewMongoSchema,
);
