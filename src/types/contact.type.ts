import { z } from "zod";

export const SendContactMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(1, "Message is required"),
});

export type SendContactMessageType = z.infer<typeof SendContactMessageSchema>;
