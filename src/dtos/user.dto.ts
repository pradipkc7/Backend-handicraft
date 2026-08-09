import { z } from "zod";
import { UserSchema } from "../types/user.type";

export const CreateUserDTO = UserSchema;

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = UserSchema.pick({
  email: true,
  password: true,
});
export const CreateUserDTOAdmin = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  password: true,
  phoneNumber: true,
  gender: true,
  role: true,
});
export type CreateUserDTOAdmin = z.infer<typeof CreateUserDTOAdmin>;

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;
export const UpdateUserDTO = UserSchema.partial();
export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
export const ChangePasswordDTO = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export type ChangePasswordDTO = z.infer<typeof ChangePasswordDTO>;
export const UpdatePasswordDTO = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Current password must be at least 6 characters long"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters long"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password must match",
    path: ["confirmPassword"],
  });
export type UpdatePasswordDTO = z.infer<typeof UpdatePasswordDTO>;

export const ForgotPasswordDTO = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordDTO>;

export const ResetPasswordDTO = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Code must be 6 digits"),
  newPassword: z.string().min(6, "New password must be at least 6 characters long"),
});

export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTO>;
