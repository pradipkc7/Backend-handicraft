import { CategoryController } from "../controllers/category.controller.ts";
import { authorizedMiddleware } from "../middlewares/authorized.middleware.ts";
import { Router } from "express";

const categoryRouter = Router();
const categoryController = new CategoryController();

categoryRouter.get("/", categoryController.getAllCategories);
categoryRouter.get("/:id", categoryController.getCategoryById);
categoryRouter.post(
  "/",
  authorizedMiddleware,
  categoryController.createCategory,
);
categoryRouter.put(
  "/:id",
  authorizedMiddleware,
  categoryController.updateCategory,
);
categoryRouter.delete(
  "/:id",
  authorizedMiddleware,
  categoryController.deleteCategory,
);

export default categoryRouter;
