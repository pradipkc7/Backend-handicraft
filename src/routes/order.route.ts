import { OrderController } from "../controllers/order.controller.ts";
import { authorizedMiddleware } from "../middlewares/authorized.middleware.ts";
import { Router } from "express";

const orderRouter = Router();
const orderController = new OrderController();

// Khalti redirects the browser here with ?pidx=... after payment — no auth on this callback
orderRouter.get("/verify-payment", orderController.verifyPayment);
orderRouter.post("/verify-payment", orderController.verifyPayment);

orderRouter.use(authorizedMiddleware);

orderRouter.post("/", orderController.createOrder);
orderRouter.get("/", orderController.getMyOrders);
orderRouter.get("/:id", orderController.getOrderById);
orderRouter.put("/:id/status", orderController.updateStatus);

export default orderRouter;
