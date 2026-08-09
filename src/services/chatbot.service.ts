import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../config/constant";
import { ChatMessageDTO } from "../dtos/chatbot.dto";
import { HttpException } from "../exceptions/http-exception";

const SYSTEM_PROMPT =
  "You are the customer support assistant for a Nepali handicraft marketplace app called Handicraft. " +
  "Help users with questions about browsing handmade craft items, placing orders, Khalti payments, " +
  "shipping/delivery, and their account. Keep answers short and friendly. If you don't know something " +
  "specific to this app, say so instead of making it up.";

export class ChatbotService {
  private client: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!GEMINI_API_KEY) {
      throw new HttpException(500, "Chatbot is not configured");
    }
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }
    return this.client;
  }

  async sendMessage(data: ChatMessageDTO): Promise<string> {
    const client = this.getClient();

    const response = await client.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        ...data.history.map((h) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        })),
        { role: "user", parts: [{ text: data.message }] },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    });

    return response.text ?? "";
  }
}
