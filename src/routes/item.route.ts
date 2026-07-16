import { ItemController } from "../controllers/item.controller.ts";
import { ReviewController } from "../controllers/review.controller.ts";
import { authorizedMiddleware } from "../middlewares/authorized.middleware.ts";
import { uploadPhoto, uploadVideo } from "../middlewares/upload.middleware.ts";
import { Router } from "express";

const itemRouter = Router();
const itemController = new ItemController();
const reviewController = new ReviewController();

itemRouter.get("/", itemController.getAllItems);

itemRouter.post(
  "/upload-photo",
  authorizedMiddleware,
  uploadPhoto.single("itemPhoto"),
  itemController.uploadPhoto,
);
itemRouter.post(
  "/upload-video",
  authorizedMiddleware,
  uploadVideo.single("itemVideo"),
  itemController.uploadVideo,
);

itemRouter.post("/", authorizedMiddleware, itemController.createItem);
itemRouter.get("/:id", itemController.getItemById);
itemRouter.put("/:id", authorizedMiddleware, itemController.updateItem);
itemRouter.delete("/:id", authorizedMiddleware, itemController.deleteItem);
itemRouter.post(
  "/:id/claim",
  authorizedMiddleware,
  itemController.claimItem,
);

itemRouter.get("/:id/reviews", reviewController.getReviewsByItem);
itemRouter.post(
  "/:id/reviews",
  authorizedMiddleware,
  reviewController.createReview,
);

export default itemRouter;
