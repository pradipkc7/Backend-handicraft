import { AddressMongoRepository } from "../repositories/address.repository";
import { CreateAddressDTO, UpdateAddressDTO } from "../dtos/address.dto";
import { IAddress } from "../models/address.model";
import { HttpException } from "../exceptions/http-exception";

const addressRepository = new AddressMongoRepository();

export class AddressService {
  async createAddress(
    addressData: CreateAddressDTO,
    userId: string,
  ): Promise<IAddress> {
    if (addressData.isDefault) {
      await addressRepository.clearDefault(userId);
    }
    return addressRepository.createAddress({
      ...addressData,
      userId,
    } as unknown as Partial<IAddress>);
  }

  async getMyAddresses(userId: string): Promise<IAddress[]> {
    return addressRepository.getAddressesByUser(userId);
  }

  async updateAddress(
    id: string,
    userId: string,
    addressData: UpdateAddressDTO,
  ): Promise<IAddress> {
    const existing = await addressRepository.getAddressById(id);
    if (!existing) {
      throw new HttpException(404, "Address not found");
    }
    if (existing.userId.toString() !== userId) {
      throw new HttpException(403, "You are not allowed to update this address");
    }
    if (addressData.isDefault) {
      await addressRepository.clearDefault(userId);
    }
    const updated = await addressRepository.update(
      id,
      addressData as unknown as Partial<IAddress>,
    );
    if (!updated) {
      throw new HttpException(404, "Address not found");
    }
    return updated;
  }

  async deleteAddress(id: string, userId: string): Promise<boolean> {
    const existing = await addressRepository.getAddressById(id);
    if (!existing) {
      throw new HttpException(404, "Address not found");
    }
    if (existing.userId.toString() !== userId) {
      throw new HttpException(403, "You are not allowed to delete this address");
    }
    return addressRepository.delete(id);
  }
}
