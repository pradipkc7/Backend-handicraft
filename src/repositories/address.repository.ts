import { AddressModel, IAddress } from "../models/address.model";

export interface IAddressRepository {
  createAddress(address: Partial<IAddress>): Promise<IAddress>;
  getAddressesByUser(userId: string): Promise<IAddress[]>;
  getAddressById(id: string): Promise<IAddress | null>;
  update(id: string, address: Partial<IAddress>): Promise<IAddress | null>;
  delete(id: string): Promise<boolean>;
  clearDefault(userId: string): Promise<void>;
}

export class AddressMongoRepository implements IAddressRepository {
  async createAddress(address: Partial<IAddress>): Promise<IAddress> {
    return AddressModel.create(address);
  }
  async getAddressesByUser(userId: string): Promise<IAddress[]> {
    return AddressModel.find({ userId }).sort({ createdAt: -1 });
  }
  async getAddressById(id: string): Promise<IAddress | null> {
    return AddressModel.findById(id);
  }
  async update(
    id: string,
    address: Partial<IAddress>,
  ): Promise<IAddress | null> {
    return AddressModel.findByIdAndUpdate(id, address, { new: true });
  }
  async delete(id: string): Promise<boolean> {
    const deleted = await AddressModel.findByIdAndDelete(id);
    return !!deleted;
  }
  async clearDefault(userId: string): Promise<void> {
    await AddressModel.updateMany({ userId }, { isDefault: false });
  }
}
