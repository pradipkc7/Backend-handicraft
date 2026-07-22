import { z } from "zod";
import { SendContactMessageSchema } from "../types/contact.type";

export const SendContactMessageDTO = SendContactMessageSchema;

export type SendContactMessageDTO = z.infer<typeof SendContactMessageDTO>;
