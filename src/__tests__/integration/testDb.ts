import mongoose from "mongoose";
import { MONGODB_URL } from "../../config/constant";

export const connectTestDb = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URL);
  }
};

export const disconnectTestDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

// Short unique-ish suffix so repeated test runs against the same shared
// dev database never collide on unique fields (email, username, slug).
export const unique = () => `${Date.now()}${Math.floor(Math.random() * 10000)}`;
