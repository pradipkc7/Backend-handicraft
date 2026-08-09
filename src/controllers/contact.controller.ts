import { Request, Response } from "express";
import { z } from "zod";
import { ApiResponseHelper } from "../utils/apihelper.util";
import { HttpException } from "../exceptions/http-exception";
import { SendContactMessageDTO } from "../dtos/contact.dto";
import { MailService } from "../services/mail.service";

const mailService = new MailService();

export class ContactController {
  async sendMessage(req: Request, res: Response) {
    try {
      const parseResult = SendContactMessageDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      await mailService.sendContactMessage(parseResult.data);
      return ApiResponseHelper.success(res, null, "Message sent successfully", 200);
    } catch (error: Error | any | unknown) {
      return ApiResponseHelper.error(
        res,
        error?.message || "Failed to send message",
        error?.status || 500,
      );
    }
  }
}
