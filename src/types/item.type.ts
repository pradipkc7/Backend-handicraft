import { z } from "zod";

export const ItemSchema = z.object({
  categoryId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be greater than 0"),
  currency: z.string().default("NPR"),
  location: z.string().min(1, "Location is required"),
  images: z.array(z.string()).default([]),
  condition: z.enum(["newItem", "likeNew", "used"]).default("newItem"),
  status: z
    .enum(["available", "sold", "reserved"])
    .default("available"),
  quantity: z.number().int().positive().optional(),
});

export type ItemType = z.infer<typeof ItemSchema>;
