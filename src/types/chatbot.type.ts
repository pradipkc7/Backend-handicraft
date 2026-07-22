import { z } from "zod";

export const ChatMessageSchema = z.object({
  message: z.string().min(1, "Message is required").max(4000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .max(20)
    .default([]),
});

export type ChatMessageType = z.infer<typeof ChatMessageSchema>;
