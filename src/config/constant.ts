import dotenv from "dotenv";
dotenv.config(); // implement .env file

// Add fallback value from env for stability
export const PORT: number = Number(process.env.PORT) || 8088; // default port is 8088
export const MONGODB_URL: string =
  process.env.MONGODB_URL || "mongodb://localhost:27017/handicraft"; // default MongoDB URL
export const SECRET_KEY: string = process.env.SECRET_KEY || "merosecretkey";

// Khalti payment gateway (sandbox base URL by default)
export const KHALTI_SECRET_KEY: string = process.env.KHALTI_SECRET_KEY || "";
export const KHALTI_BASE_URL: string =
  process.env.KHALTI_BASE_URL || "https://a.khalti.com/api/v2";
export const KHALTI_RETURN_URL: string =
  process.env.KHALTI_RETURN_URL || "http://localhost:8088/api/v1/orders/verify-payment";
export const KHALTI_WEBSITE_URL: string =
  process.env.KHALTI_WEBSITE_URL || "http://localhost:8088";

// Anthropic Claude API (for the chatbot)
export const ANTHROPIC_API_KEY: string = process.env.ANTHROPIC_API_KEY || "";

// Email (for forgot-password reset codes)
export const EMAIL_USER: string = process.env.EMAIL_USER || "";
export const EMAIL_PASS: string = process.env.EMAIL_PASS || "";
export const EMAIL_FROM: string = process.env.EMAIL_FROM || EMAIL_USER;
