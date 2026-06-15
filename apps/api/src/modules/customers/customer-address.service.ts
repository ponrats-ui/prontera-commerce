import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import type {
  CreateCustomerAddressDto,
  UpdateCustomerAddressDto,
} from "./dto/customer.dto";
import { CustomerPermissionsService } from "./customer-permissions.service";

const nullable = (value?: string | null): string | null => value ?? null;

@Injectable()
export class CustomerAddressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: CustomerPermissionsService,
  ) {}

  async addAddress(
    user: AuthenticatedUser,
    customerId: string,
    dto: CreateCustomerAddressDto,
  ) {
    const customer = await this.getCustomerOrThrow(customerId);
    await this.assertCanWrite(user.id, customer.shopId);

    return this.prisma.$transaction(async (tx) => {
      await this.clearDefaults(tx, customerId, dto);
      const data: Prisma.CustomerAddressUncheckedCreateInput = {
        customerId,
        label: nullable(dto.label),
        recipientName: nullable(dto.recipientName),
        phone: nullable(dto.phone),
        addressLine1: dto.addressLine1,
        addressLine2: nullable(dto.addressLine2),
        district: nullable(dto.district),
        province: nullable(dto.province),
        postalCode: nullable(dto.postalCode),
        countryCode: dto.countryCode,
        isDefaultShipping: dto.isDefaultShipping ?? false,
        isDefaultBilling: dto.isDefaultBilling ?? false,
      };

      const address = await tx.customerAddress.create({
        data,
      });

      await tx.customerActivity.create({
        data: {
          customerId,
          type: "address_added",
          performedBy: user.id,
          metadata: { addressId: address.id },
        },
      });

      return address;
    });
  }

  async listAddresses(user: AuthenticatedUser, customerId: string) {
    const customer = await this.getCustomerOrThrow(customerId);
    await this.assertCanRead(user.id, customer.shopId);

    return this.prisma.customerAddress.findMany({
      where: { customerId, deletedAt: null },
      orderBy: [{ isDefaultShipping: "desc" }, { createdAt: "desc" }],
    });
  }

  async updateAddress(
    user: AuthenticatedUser,
    customerId: string,
    addressId: string,
    dto: UpdateCustomerAddressDto,
  ) {
    const customer = await this.getCustomerOrThrow(customerId);
    await this.assertCanWrite(user.id, customer.shopId);

    const existing = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException("Customer address not found.");
    }

    return this.prisma.$transaction(async (tx) => {
      await this.clearDefaults(tx, customerId, dto);

      return tx.customerAddress.update({
        where: { id: addressId },
        data: dto,
      });
    });
  }

  async deleteAddress(
    user: AuthenticatedUser,
    customerId: string,
    addressId: string,
  ) {
    const customer = await this.getCustomerOrThrow(customerId);
    await this.assertCanWrite(user.id, customer.shopId);

    const existing = await this.prisma.customerAddress.findFirst({
      where: { id: addressId, customerId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException("Customer address not found.");
    }

    await this.prisma.customerAddress.update({
      where: { id: addressId },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  private async getCustomerOrThrow(customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
      select: { id: true, shopId: true },
    });

    if (!customer) {
      throw new NotFoundException("Customer not found.");
    }

    return customer;
  }

  private async assertCanRead(userId: string, shopId: string) {
    if (!(await this.permissions.canReadCustomers(userId, shopId))) {
      throw new ForbiddenException("You cannot read this customer.");
    }
  }

  private async assertCanWrite(userId: string, shopId: string) {
    if (!(await this.permissions.canWriteCustomers(userId, shopId))) {
      throw new ForbiddenException("You cannot update this customer.");
    }
  }

  private async clearDefaults(
    tx: Prisma.TransactionClient,
    customerId: string,
    dto: { isDefaultShipping?: boolean; isDefaultBilling?: boolean },
  ) {
    if (dto.isDefaultShipping) {
      await tx.customerAddress.updateMany({
        where: { customerId, deletedAt: null },
        data: { isDefaultShipping: false },
      });
    }

    if (dto.isDefaultBilling) {
      await tx.customerAddress.updateMany({
        where: { customerId, deletedAt: null },
        data: { isDefaultBilling: false },
      });
    }
  }
}
