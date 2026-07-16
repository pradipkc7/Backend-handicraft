import { z } from "zod";

export const CreateOrderSchema = z.object({
  shippingLocation: z.string().min(1, "Shipping location is required"),
  paymentMethod: z.enum(["khalti", "cod"]).default("khalti"),
});

export type CreateOrderType = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "shipped", "completed", "cancelled"]),
});

export type UpdateOrderStatusType = z.infer<typeof UpdateOrderStatusSchema>;
