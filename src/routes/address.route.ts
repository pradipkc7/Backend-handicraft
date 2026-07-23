import { AddressController } from "../controllers/address.controller.ts";
import { authorizedMiddleware } from "../middlewares/authorized.middleware.ts";
import { Router } from "express";

const addressRouter = Router();
const addressController = new AddressController();

addressRouter.use(authorizedMiddleware);

addressRouter.get("/", addressController.getMyAddresses);
addressRouter.post("/", addressController.createAddress);
addressRouter.put("/:id", addressController.updateAddress);
addressRouter.delete("/:id", addressController.deleteAddress);

export default addressRouter;
