import { ChatbotService } from "../services/chatbot.service.ts";
import { HttpException } from "../exceptions/http-exception.ts";
import { z } from "zod";
import * as ChatbotDto from "../dtos/chatbot.dto.ts";
import { ApiResponseHelper } from "../utils/apihelper.util.ts";
import { Request, Response } from "express";

const chatbotService = new ChatbotService();

export class ChatbotController {
  async sendMessage(req: Request, res: Response) {
    try {
      const parseResult = ChatbotDto.ChatMessageDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const reply = await chatbotService.sendMessage(parseResult.data);
      return ApiResponseHelper.success(res, { reply }, "Reply generated", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to get chatbot reply",
        e.status || 500,
      );
    }
  }
}
