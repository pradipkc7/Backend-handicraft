import { UserService } from "../services/user.service";
import { HttpException } from "../exceptions/http-exception";
import { z } from "zod";
import * as UserDto from "../dtos/user.dto";
import { ApiResponseHelper } from "../utils/apihelper.util.ts";
import { Request, Response } from "express";
import { ChangePasswordDTO } from "../dtos/user.dto";

const userService = new UserService();

export class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const parseResult = UserDto.CreateUserDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const createdUser = await userService.createUser(parseResult.data);
      return ApiResponseHelper.success(res, createdUser, "User created", 201);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to create user",
        e.status || 500,
      );
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const parseResult = UserDto.LoginUserDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const { user, token } = await userService.loginUser(parseResult.data);
      return ApiResponseHelper.success(
        res,
        { user, token },
        "Login successful",
        200,
      );
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to create user",
        e.status || 500,
      );
    }
  }
  async whoami(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return ApiResponseHelper.error(res, "User not found", 404);
      }
      return ApiResponseHelper.success(
        res,
        user,
        "User details fetched successfully",
      );
    } catch (error: Error | any | unknown) {
      return ApiResponseHelper.error(
        res,
        error.message || "Internal Server Error",
        error.status || 500,
      );
    }
  }
  async changePassword(req: Request, res: Response) {
    try {
      const parseResult = ChangePasswordDTO.safeParse(req.body);

      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }

      const userId = (req.user as any)._id || (req.user as any).id;

      const user = await userService.changePassword(
        userId.toString(),
        parseResult.data.oldPassword,
        parseResult.data.newPassword,
      );

      return ApiResponseHelper.success(
        res,
        user,

        "Password updated successfully",
      );
    } catch (e: any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to update password",
        e?.status || 500,
      );
    }
  }
  async forgotPassword(req: Request, res: Response) {
    try {
      const parseResult = UserDto.ForgotPasswordDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      await userService.forgotPassword(parseResult.data.email);
      return ApiResponseHelper.success(
        res,
        null,
        "If that email exists, a reset code has been sent",
        200,
      );
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to process forgot password request",
        e.status || 500,
      );
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const parseResult = UserDto.ResetPasswordDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      await userService.resetPassword(
        parseResult.data.email,
        parseResult.data.code,
        parseResult.data.newPassword,
      );
      return ApiResponseHelper.success(res, null, "Password reset successful", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to reset password",
        e.status || 500,
      );
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      const filename = req.file?.filename;
      const parseResult = UserDto.UpdateUserDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const updateData = {
        ...parseResult.data,
        ...(filename && { imageUrl: "/uploads/" + filename }),
      };
      const updatedUser = await userService.updateUser(userId, updateData);
      return ApiResponseHelper.success(res, updatedUser, "User updated");
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to update user",
        e.status || 500,
      );
    }
  }
}
