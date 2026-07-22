import { UserMongoRepository } from "../repositories/user.repository";
import {
  CreateUserDTO,
  LoginUserDTO,
  UpdateUserDTO,
  ChangePasswordDTO,
} from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { SECRET_KEY } from "../config/constant";
import { MailService } from "./mail.service";

const userRepository = new UserMongoRepository();
const mailService = new MailService();

const RESET_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export class UserService {
  async createUser(userData: CreateUserDTO): Promise<IUser> {
    // validation
    const existingEmail = await userRepository.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new HttpException(400, "Email already exists");
    }
    const existingUsername = await userRepository.getUserByUsername(
      userData.username,
    );
    if (existingUsername) {
      throw new HttpException(400, "Username already exists");
    }
    // hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;
    const user = await userRepository.createUser(userData);
    const safeUser = user.toObject();
    delete safeUser.password;
    return safeUser as IUser;
  }

  async loginUser(loginData: LoginUserDTO) {
    const user = await userRepository.getUserByEmailWithPassword(
      loginData.email,
    );
    if (!user) {
      throw new HttpException(400, "Invalid email");
    }
    const isPasswordValid = await bcrypt.compare(
      loginData.password, // client password
      user.password, // database password
    );
    if (!isPasswordValid) {
      throw new HttpException(400, "Invalid password");
    }
    const token = jwt.sign(
      { id: user._id, email: user.email }, // payload
      SECRET_KEY,
      { expiresIn: "30d" },
    );
    const safeUser = user.toObject();
    delete safeUser.password;
    return { user: safeUser, token };
  }
  async updateUser(id: string, updateData: UpdateUserDTO) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    if (updateData.email && updateData.email !== user.email) {
      const existingUserByEmail = await userRepository.getUserByEmail(
        updateData.email,
      );
      if (existingUserByEmail) {
        throw new HttpException(400, "Email already exists");
      }
    }
    if (updateData.username && updateData.username !== user.username) {
      const existingUserByUsername = await userRepository.getUserByUsername(
        updateData.username,
      );
      if (existingUserByUsername) {
        throw new HttpException(400, "Username already exists");
      }
    }
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    const updatedUser = await userRepository.update(id, updateData);
    return updatedUser;
  }
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await userRepository.getUserByIdWithPassword(userId);

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new HttpException(400, "Old password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await userRepository.update(userId, {
      password: hashedPassword,
    } as any);

    return updatedUser;
  }
  async deleteUser(id: string): Promise<boolean> {
    const existingUser = await userRepository.getUserById(id);
    if (!existingUser) {
      throw new HttpException(404, "User not found");
    }
    const deleted = await userRepository.delete(id);
    if (!deleted) {
      throw new HttpException(500, "Failed to delete user");
    }
    return deleted;
  }
  async checkPassword(
    userId: string,
    currentPassword: string,
  ): Promise<boolean> {
    const user = await userRepository.getUserByIdWithPassword(userId);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new HttpException(400, "Current password is incorrect");
    }
    return isPasswordValid;
  }
  async getAllUserPaginated(page?: string, limit?: string, search?: string) {
    const currentPage = page && parseInt(page) > 0 ? parseInt(page) : 1;
    const currentLimit = limit && parseInt(limit) > 0 ? parseInt(limit) : 10;
    const currentSearch = search && search.trim() !== "" ? search : undefined;

    const { data, total } = await userRepository.getAllPaginated(
      currentPage,
      currentLimit,
      currentSearch,
    );
    const totalPages = Math.ceil(total / currentLimit);
    const pagination = {
      page: currentPage,
      limit: currentLimit,
      totalPages: totalPages,
      total: total,
    };
    return { data, pagination };
  }
  async getUserById(id: string): Promise<IUser | null> {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpException(404, "User not found");
    }
    return user;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.getUserByEmail(email);
    // Don't reveal whether the email exists — respond the same either way
    if (!user) {
      return;
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const hashedCode = await bcrypt.hash(code, 10);

    await userRepository.update(user._id.toString(), {
      resetPasswordCode: hashedCode,
      resetPasswordExpires: new Date(Date.now() + RESET_CODE_TTL_MS),
    } as Partial<IUser>);

    await mailService.sendResetCode(user.email, code);
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    const user = await userRepository.getUserByEmailWithResetFields(email);
    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      throw new HttpException(400, "Invalid or expired reset code");
    }
    if (user.resetPasswordExpires.getTime() < Date.now()) {
      throw new HttpException(400, "Reset code has expired");
    }

    const isCodeValid = await bcrypt.compare(code, user.resetPasswordCode);
    if (!isCodeValid) {
      throw new HttpException(400, "Invalid or expired reset code");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.update(user._id.toString(), {
      password: hashedPassword,
    } as Partial<IUser>);
    await userRepository.clearResetCode(user._id.toString());
  }
}
