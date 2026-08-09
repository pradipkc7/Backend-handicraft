import mongoose, { Schema, Document } from "mongoose";
import { ProductType } from "../types/product.type";

export interface IProduct extends ProductType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductMongoSchema: Schema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    images: { type: [String], default: [] },
    materials: { type: String, trim: true },
    size: { type: String, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    artisanName: { type: String, trim: true },
    location: { type: String, trim: true },
    tags: { type: [String], default: [] },
    rating: { type: Number, required: false, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, required: false, default: 0 },
  },
  {
    timestamps: true,
  },
);

export const ProductModel = mongoose.model<IProduct>(
  "Product",
  ProductMongoSchema,
);
