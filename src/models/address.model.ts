import mongoose, { Schema, Document } from "mongoose";
import { AddressType } from "../types/address.type";

export interface IAddress extends AddressType, Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AddressMongoSchema: Schema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    label: { type: String, required: true, default: "Home" },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export const AddressModel = mongoose.model<IAddress>(
  "Address", // db.addresses -> Model Name "Address"
  AddressMongoSchema,
);
