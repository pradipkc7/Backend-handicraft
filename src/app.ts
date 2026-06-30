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

const app: Application = express();
let corsOptions = {
  origin: ["*"],
  successStatus: 200,
};
// impl path
app.use("/uploads", express.static(path.join(__dirname, "../uploads"))); // static file serving in uploads folder

// impl routes
app.use("/api/v1/file", uploadRoutes); // file upload routes
app.use(cors(corsOptions)); // enable CORS for all routes

app.use(express.json()); // json input
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded
app.use(morgan("combined"));
app.use("/api/v1/users", userRoutes); // compatibility alias for user routes
// admin routes
app.use("/api/v1/admin/users", adminUserRoutes); // admin user related routes


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
