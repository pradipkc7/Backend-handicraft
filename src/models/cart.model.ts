import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  itemId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const CartMongoSchema: Schema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: { type: [CartItemSchema], default: [] },
  },
  {
    timestamps: true,
  },
);

export const CartModel = mongoose.model<ICart>(
  "Cart", // db.carts -> Model Name "Cart"
  CartMongoSchema,
);
