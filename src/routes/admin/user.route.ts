import { AdmimUserController } from "../../controllers/admin/user.controller";
import { Router } from "express";
import { authorizedMiddleware } from "../../middlewares/authorized.middleware";

const adminUserRouter = Router();
const adminController = new AdmimUserController();

adminUserRouter.post(
  "/create",
  authorizedMiddleware,
  adminController.createUser,
);

export default adminUserRouter;
