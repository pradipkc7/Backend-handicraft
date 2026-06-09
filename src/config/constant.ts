import dotenv from "dotenv";
dotenv.config(); // implement .env file

// Add fallback value from env for stability
export const PORT: number = Number(process.env.PORT) || 8088; // default port is 8088
export const MONGODB_URL: string =
  process.env.MONGODB_URL || "mongodb://localhost:27017/handicraft"; // default MongoDB URL
export const SECRET_KEY: string = process.env.SECRET_KEY || "merosecretkey";
