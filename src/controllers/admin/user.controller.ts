import { UserService } from "../../services/user.service";
import { HttpException } from "../../exceptions/http-exception";
import { z } from "zod";
import { CreateUserDTO, LoginUserDTO } from "../../dtos/user.dto";
import { ApiResponseHelper } from "../../utils/apihelper.util";
import { Request, Response } from "express";

const userService = new UserService();

export class AdmimUserController {
  async createUser(req: Request, res: Response) {
    try {
      const parseResult = CreateUserDTO.safeParse(req.body);
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
}
