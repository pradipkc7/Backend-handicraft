import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS, EMAIL_FROM } from "../config/constant";
import { HttpException } from "../exceptions/http-exception";

export class MailService {
  private transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  async sendResetCode(to: string, code: string): Promise<void> {
    if (!EMAIL_USER || !EMAIL_PASS) {
      throw new HttpException(500, "Email service is not configured");
    }
    await this.transporter.sendMail({
      from: `"Handicraft" <${EMAIL_FROM}>`,
      to,
      subject: "Your Handicraft password reset code",
      text: `Your password reset code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
      html: `<p>Your password reset code is:</p><h2 style="letter-spacing:4px">${code}</h2><p>It expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
    });
  }
}
