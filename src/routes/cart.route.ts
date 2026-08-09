import { CartController } from "../controllers/cart.controller.ts";
import { authorizedMiddleware } from "../middlewares/authorized.middleware.ts";
import { Router } from "express";

const cartRouter = Router();
const cartController = new CartController();

cartRouter.use(authorizedMiddleware);

cartRouter.get("/", cartController.getCart);
cartRouter.post("/", cartController.addItem);
cartRouter.put("/:itemId", cartController.updateItem);
cartRouter.delete("/:itemId", cartController.removeItem);
cartRouter.delete("/", cartController.clearCart);

export default cartRouter;
