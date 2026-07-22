import { z } from "zod";
import { ChatMessageSchema } from "../types/chatbot.type";

export const ChatMessageDTO = ChatMessageSchema;

export type ChatMessageDTO = z.infer<typeof ChatMessageDTO>;
