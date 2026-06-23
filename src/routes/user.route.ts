import { UserController } from "../controllers/user.controller.ts";
import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware.ts";

const userRouter = Router();
const userController = new UserController();

userRouter.post("/register", userController.createUser);
userRouter.post("/login", userController.loginUser);

userRouter.put(
  "/update",
  authorizedMiddleware, //user shold be logged in->req.user
  uploads.single("profileImage"), //multer for file upload ->req.file
  userController.updateUser,
);
userRouter.get(
  "/whoami",
  authorizedMiddleware, //user shold be logged in->req.user

  userController.whoami,
);
export default userRouter;
