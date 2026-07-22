import { z } from "zod";

export const ProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  discountPrice: z.coerce
    .number()
    .min(0, "Discount price must be non-negative")
    .optional(),
  images: z.array(z.string()).optional().default([]),
  materials: z.string().optional(),
  size: z.string().optional(),
  stock: z.coerce
    .number()
    .min(0, "Stock must be non-negative")
    .optional()
    .default(0),
  featured: z.coerce.boolean().optional().default(false),
  isActive: z.coerce.boolean().optional().default(true),
  artisanName: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  rating: z.coerce.number().min(0).max(5).optional().default(0),
  totalReviews: z.coerce.number().min(0).optional().default(0),
});

export type ProductType = z.infer<typeof ProductSchema>;
