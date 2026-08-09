import { AddressService } from "../services/address.service.ts";
import { HttpException } from "../exceptions/http-exception.ts";
import { z } from "zod";
import * as AddressDto from "../dtos/address.dto.ts";
import { ApiResponseHelper } from "../utils/apihelper.util.ts";
import { Request, Response } from "express";

const addressService = new AddressService();

export class AddressController {
  async createAddress(req: Request, res: Response) {
    try {
      const parseResult = AddressDto.CreateAddressDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const userId = (req.user as any)._id.toString();
      const created = await addressService.createAddress(
        parseResult.data,
        userId,
      );
      return ApiResponseHelper.success(res, created, "Address created", 201);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to create address",
        e.status || 500,
      );
    }
  }

  async getMyAddresses(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id.toString();
      const addresses = await addressService.getMyAddresses(userId);
      return ApiResponseHelper.success(
        res,
        addresses,
        "Addresses fetched successfully",
        200,
      );
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to fetch addresses",
        e.status || 500,
      );
    }
  }

  async updateAddress(req: Request, res: Response) {
    try {
      const parseResult = AddressDto.UpdateAddressDTO.safeParse(req.body);
      if (!parseResult.success) {
        throw new HttpException(400, z.prettifyError(parseResult.error));
      }
      const userId = (req.user as any)._id.toString();
      const updated = await addressService.updateAddress(
        req.params.id as string,
        userId,
        parseResult.data,
      );
      return ApiResponseHelper.success(res, updated, "Address updated", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to update address",
        e.status || 500,
      );
    }
  }

  async deleteAddress(req: Request, res: Response) {
    try {
      const userId = (req.user as any)._id.toString();
      await addressService.deleteAddress(req.params.id as string, userId);
      return ApiResponseHelper.success(res, null, "Address deleted", 200);
    } catch (e: Error | unknown | any) {
      return ApiResponseHelper.error(
        res,
        e?.message || "Failed to delete address",
        e.status || 500,
      );
    }
  }
}
