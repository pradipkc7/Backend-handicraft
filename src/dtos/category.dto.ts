import { z } from "zod";
import { CategorySchema } from "../types/category.type";

export const CreateCategoryDTO = CategorySchema;

export type CreateCategoryDTO = z.infer<typeof CreateCategoryDTO>;

export const UpdateCategoryDTO = CategorySchema.partial();

export type UpdateCategoryDTO = z.infer<typeof UpdateCategoryDTO>;
