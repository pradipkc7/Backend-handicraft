import { z } from "zod";

export const AddProductCartItemSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  quantity: z.number().int().positive().default(1),
});

export type AddProductCartItemType = z.infer<typeof AddProductCartItemSchema>;

export const UpdateProductCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export type UpdateProductCartItemType = z.infer<
  typeof UpdateProductCartItemSchema
>;
