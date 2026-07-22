import { ChatbotController } from "../controllers/chatbot.controller.ts";
import { authorizedMiddleware } from "../middlewares/authorized.middleware.ts";
import { Router } from "express";

const chatbotRouter = Router();
const chatbotController = new ChatbotController();

chatbotRouter.post(
  "/message",
  authorizedMiddleware,
  chatbotController.sendMessage,
);

export default chatbotRouter;
