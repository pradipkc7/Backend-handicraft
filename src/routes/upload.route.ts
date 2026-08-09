import { Router } from "express";
import { uploads } from "../middlewares/upload.middleware";
import { HttpException } from "../exceptions/http-exception";
import { ApiResponseHelper } from "../utils/apihelper.util";
const router = Router();
// Single file upload
router.post("/upload", uploads.single("image"), (req, res) => {
  try {
    if (!req.file) {
      throw new HttpException(400, "No file uploaded");
    }
    req.file.path = "/uploads/" + req.file.filename; // set file path for response
    return ApiResponseHelper.success(
      res,
      req.file,

      "File uploaded successfully",
    );
  } catch (error: Error | any | unknown) {
    return ApiResponseHelper.error(
      res,
      error?.message || "Failed to upload file",
      error?.status || 500,
    );
  }
});

export default router;
