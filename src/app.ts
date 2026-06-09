import express, { Application, NextFunction, Request, Response } from "express";
import { HttpException } from "./exceptions/http-exception.ts";
import { ApiResponseHelper } from "./utils/apihelper.util.ts";
import cors from "cors";

// routes
import userRoutes from "./routes/user.route.ts";
// import adminRoutes from "./routes/admin/user.route.ts";

const app: Application = express();
const corsOptions = {
  origin: ["*"],
  successStatus: 200,
};
app.use(cors(corsOptions)); // enable CORS for all routes

app.use(express.json()); // json input
app.use(express.urlencoded({ extended: true })); // x-www-form-urlencoded

app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({ message: "Backend API is running" });
});

app.get("/api/v1", (_req: Request, res: Response) => {
  return res.status(200).json({
    message: "API is running",
    endpoints: [
      "/api/v1/auth/register",
      "/api/v1/auth/login",
      "/api/v1/users/register",
      "/api/v1/users/login",
    ],
  });
});

app.get("/api/v1/auth", (_req: Request, res: Response) => {
  return res.status(200).json({
    message: "Auth routes available",
    endpoints: ["/api/v1/auth/register", "/api/v1/auth/login"],
  });
});

app.use("/api/v1/auth", userRoutes); // user related routes
app.use("/api/v1/users", userRoutes); // compatibility alias for user routes
// app.use("/api/v1/admin", adminRoutes); // admin routes

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
