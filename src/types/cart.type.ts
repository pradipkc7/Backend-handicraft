import { z } from "zod";

export const AddCartItemSchema = z.object({
  itemId: z.string().min(1, "itemId is required"),
  quantity: z.number().int().positive().default(1),
});

export type AddCartItemType = z.infer<typeof AddCartItemSchema>;

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export type UpdateCartItemType = z.infer<typeof UpdateCartItemSchema>;
