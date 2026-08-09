import mongoose, { Schema, Document } from "mongoose";
import { ItemType } from "../types/item.type";

export interface IItem extends Omit<ItemType, "categoryId">, Document {
  _id: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  buyerId?: mongoose.Types.ObjectId;
  categoryId?: mongoose.Types.ObjectId;
  rating?: number;
  totalReviews?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ItemMongoSchema: Schema = new Schema<IItem>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: false },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, required: true, default: "NPR" },
    location: { type: String, required: true },
    images: { type: [String], default: [] },
    condition: {
      type: String,
      enum: ["newItem", "likeNew", "used"],
      required: true,
      default: "newItem",
    },
    status: {
      type: String,
      enum: ["available", "sold", "reserved"],
      required: true,
      default: "available",
    },
    rating: { type: Number, required: false },
    totalReviews: { type: Number, required: false, default: 0 },
    quantity: { type: Number, required: false, default: 1 },
  },
  {
    timestamps: true,
  },
);

export const ItemModel = mongoose.model<IItem>(
  "Item", // db.items -> Model Name "Item"
  ItemMongoSchema,
);
