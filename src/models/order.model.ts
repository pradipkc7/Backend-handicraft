import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  itemId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  title: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  currency: string;
  shippingLocation: string;
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
  paymentMethod: "khalti" | "cod";
  paymentStatus: "pending" | "completed" | "failed";
  khaltiPidx?: string;
  khaltiTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false },
);

const OrderMongoSchema: Schema = new Schema<IOrder>(
  {
    buyerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    currency: { type: String, required: true, default: "NPR" },
    shippingLocation: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "completed", "cancelled"],
      required: true,
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["khalti", "cod"],
      required: true,
      default: "khalti",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      required: true,
      default: "pending",
    },
    khaltiPidx: { type: String, required: false },
    khaltiTransactionId: { type: String, required: false },
  },
  {
    timestamps: true,
  },
);

export const OrderModel = mongoose.model<IOrder>(
  "Order", // db.orders -> Model Name "Order"
  OrderMongoSchema,
);
