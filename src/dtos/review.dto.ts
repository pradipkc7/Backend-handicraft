import { z } from "zod";
import { CreateReviewSchema } from "../types/review.type";

export const CreateReviewDTO = CreateReviewSchema;

export type CreateReviewDTO = z.infer<typeof CreateReviewDTO>;
