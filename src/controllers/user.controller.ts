import { UserService } from "../services/user.service.ts";
import { HttpException } from "../exceptions/http-exception.ts";
import { z } from "zod";
import * as UserDto from "../dtos/user.dto.ts";
import { ApiResponseHelper } from "../utils/apihelper.util.ts";
import { Request, Response } from "express";

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
      console.error("Create user error:", e);
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
}
