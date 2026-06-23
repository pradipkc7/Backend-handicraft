import { UserMongoRepository } from "../repositories/user.repository";
import {
  CreateUserDTO,
  LoginUserDTO,
  UpdateUserDto,
  ChangePasswordDto,
} from "../dtos/user.dto";
import { IUser } from "../models/user.model";
import { HttpException } from "../exceptions/http-exception";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config/constant";

const userRepository = new UserMongoRepository();

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
    return user;
  }

  async loginUser(loginData: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(loginData.email);
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
    return { user, token };
  }
  async updateUser(id: string, updateData: UpdateUserDto) {
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
    const user = await userRepository.getUserById(userId);

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
}
