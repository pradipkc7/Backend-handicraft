import multer from "multer";
import uuid from "uuid";
import path from "path";
import { Request } from "express";
import { HttpException } from "../exceptions/http-exception";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    const uploadPath = path.join(__dirname, "../../uploads"); // __dirname -> current dir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath); // create uploads dir if not exists
    }
    cb(null, uploadPath); // save to uploads dir
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const fileSuffix = uuidv4(); // unique suffix
    cb(null, fileSuffix + "-" + file.originalname); // unique filename
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true); // accept file
  } else {
    cb(new HttpException(400, "Only JPEG and PNG files are allowed")); // reject file
  }
};
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB limit
  },
  fileFilter,
});

export const uploads = {
  single: (fieldName: string) => upload.single(fieldName),
  array: (fieldName: string, maxCount: number) =>
    upload.array(fieldName, maxCount),
  fields: (
    fieldsArray: {
      name: string;
      maxCount?: number;
    }[],
  ) => upload.fields(fieldsArray),
};

export const uploadPhoto = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new HttpException(400, "Only image files are allowed"));
    }
  },
});

export const uploadVideo = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new HttpException(400, "Only video files are allowed"));
    }
  },
});
