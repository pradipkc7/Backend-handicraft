import { Router } from "express";
import { ProductController } from "../controllers/product.controller";
import {
  authorizedMiddleware,
  adminMiddleware,
} from "../middlewares/authorized.middleware";

const router = Router();
const productController = new ProductController();

router.get("/featured", productController.getFeaturedProducts);
router.get("/categories", productController.getCategories);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

router.post(
  "/",
  authorizedMiddleware,
  adminMiddleware,
  productController.createProduct,
);
router.put(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  productController.updateProduct,
);
router.delete(
  "/:id",
  authorizedMiddleware,
  adminMiddleware,
  productController.deleteProduct,
);

export default router;
