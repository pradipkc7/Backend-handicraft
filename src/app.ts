import express, { Application, NextFunction, Request, Response } from "express";
import { HttpException } from "./exceptions/http-exception";
import { ApiResponseHelper } from "./utils/apihelper.util";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import uploadRoutes from "./routes/upload.route";

// routes
import userRoutes from "./routes/user.route";
import adminUserRoutes from "./routes/admin/user.route";
import adminProductRoutes from "./routes/admin/product.route";
import productRoutes from "./routes/product.route";
import categoryRoutes from "./routes/category.route";
import itemRoutes from "./routes/item.route";
import cartRoutes from "./routes/cart.route";
import orderRoutes from "./routes/order.route";
import chatbotRoutes from "./routes/chatbot.route";
import contactRoutes from "./routes/contact.route";

const app: Application = express();
let corsOptions = {
  origin: "*",
  successStatus: 200,
};
// impl path
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // static file serving in uploads folder

app.use(cors(corsOptions)); // enable CORS for all routes

// impl routes
app.use("/api/v1/file", uploadRoutes); // file upload routes

app.use(express.json()); // json input
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded
app.use(morgan("combined"));

app.get("/api/v1", (_req: Request, res: Response) => {
  return res.status(200).json({
    message: "API is running",
    endpoints: [
      "/api/v1/users",
      "/api/v1/products",
      "/api/v1/categories",
      "/api/v1/items",
      "/api/v1/cart",
      "/api/v1/orders",
      "/api/v1/chatbot",
      "/api/v1/contact",
      "/api/v1/file",
      "/api/v1/admin/users",
      "/api/v1/admin/products",
    ],
  });
});

app.use("/api/v1/users", userRoutes); // compatibility alias for user routes
app.use("/api/v1/products", productRoutes); // public handicraft product catalog routes for app and website
app.use("/api/v1/categories", categoryRoutes); // category related routes
app.use("/api/v1/items", itemRoutes); // item related routes
app.use("/api/v1/cart", cartRoutes); // cart related routes
app.use("/api/v1/orders", orderRoutes); // order + khalti payment routes
app.use("/api/v1/chatbot", chatbotRoutes); // AI chatbot routes
app.use("/api/v1/contact", contactRoutes); // contact form -> emails the shop inbox
// admin routes
app.use("/api/v1/admin/users", adminUserRoutes); // admin user related routes
app.use("/api/v1/admin/products", adminProductRoutes); // admin product management routes

// global api handler (at the last)
app.use((req: Request, res: Response) => {
  return res.status(404).json({
    message: "API not found",
    path: req.originalUrl,
    method: req.method,
  });
});
// global error handler (at the last)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  if (err instanceof HttpException) {
    return ApiResponseHelper.error(res, err.message, err.status);
  }
  return ApiResponseHelper.error(res, "Internal Server Error", 500);
});

export default app;
