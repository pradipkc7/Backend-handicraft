import { Router } from "express";
import { ContactController } from "../controllers/contact.controller";

const router = Router();
const contactController = new ContactController();

router.post("/", contactController.sendMessage);

export default router;
