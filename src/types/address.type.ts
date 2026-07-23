import { z } from "zod";

export const AddressSchema = z.object({
  label: z.string().min(1, "Label is required").default("Home"),
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  addressLine: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  isDefault: z.boolean().default(false),
});

export type AddressType = z.infer<typeof AddressSchema>;
