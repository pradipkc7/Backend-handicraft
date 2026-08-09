import { z } from "zod";
import { AddCartItemSchema, UpdateCartItemSchema } from "../types/cart.type";

export const AddCartItemDTO = AddCartItemSchema;

export type AddCartItemDTO = z.infer<typeof AddCartItemDTO>;

export const UpdateCartItemDTO = UpdateCartItemSchema;

export type UpdateCartItemDTO = z.infer<typeof UpdateCartItemDTO>;
