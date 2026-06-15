import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CustomerGroupStatus,
  CustomerLoyaltyStatus,
  CustomerLoyaltyTier,
  CustomerNoteVisibility,
  CustomerSource,
  CustomerStatus,
  CustomerTagStatus,
  Prisma,
} from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import { CustomerPermissionsService } from "./customer-permissions.service";
import type {
  CreateCustomerDto,
  CreateCustomerGroupDto,
  CreateCustomerNoteDto,
  CreateCustomerTagDto,
  UpdateCustomerDto,
  UpdateCustomerGroupDto,
  UpdateCustomerLoyaltyDto,
  UpdateCustomerTagDto,
} from "./dto/customer.dto";

const customerInclude = {
  addresses: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
  notes: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
  tagAssignments: {
    where: { deletedAt: null },
    include: { tag: true },
  },
  groupMemberships: {
    where: { deletedAt: null },
    include: { group: true },
  },
  loyaltyAccount: true,
} satisfies Prisma.CustomerInclude;

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: CustomerPermissionsService,
  ) {}

  async createCustomer(
    user: AuthenticatedUser,
    shopId: string,
    dto: CreateCustomerDto,
  ) {
    await this.assertCanWrite(user.id, shopId);
    const normalizedEmail = this.normalizeEmail(dto.email);
    const normalizedPhone = this.normalizePhone(dto.phone);
    await this.assertUniqueContact(shopId, normalizedEmail, normalizedPhone);

    const displayName = this.resolveDisplayName(dto);

    return this.prisma.$transaction(async (tx) => {
      const data: Prisma.CustomerCreateInput = {
        shop: { connect: { id: shopId } },
        displayName,
        status: dto.status ?? CustomerStatus.ACTIVE,
        source: dto.source ?? CustomerSource.MANUAL,
        timeZone: dto.timeZone ?? "UTC",
        loyaltyAccount: { create: {} },
      };

      this.applyCustomerFields(data, dto, normalizedEmail, normalizedPhone);

      const customer = await tx.customer.create({
        data,
        include: customerInclude,
      });

      await tx.customerActivity.create({
        data: {
          customerId: customer.id,
          type: "customer_created",
          performedBy: user.id,
          metadata: { source: customer.source },
        },
      });

      return customer;
    });
  }

  async listCustomers(user: AuthenticatedUser, shopId: string) {
    await this.assertCanRead(user.id, shopId);

    return this.prisma.customer.findMany({
      where: { shopId, deletedAt: null },
      include: customerInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  async getCustomer(user: AuthenticatedUser, customerId: string) {
    const customer = await this.getCustomerOrThrow(customerId);
    await this.assertCanRead(user.id, customer.shopId);
    return customer;
  }

  async updateCustomer(
    user: AuthenticatedUser,
    customerId: string,
    dto: UpdateCustomerDto,
  ) {
    const customer = await this.getCustomerOrThrow(customerId);
    await this.assertCanWrite(user.id, customer.shopId);

    const normalizedEmail = this.normalizeEmail(dto.email);
    const normalizedPhone = this.normalizePhone(dto.phone);
    await this.assertUniqueContact(
      customer.shopId,
      normalizedEmail,
      normalizedPhone,
      customerId,
    );

    const data: Prisma.CustomerUpdateInput = {};
    this.applyCustomerFields(data, dto, normalizedEmail, normalizedPhone);

    if (dto.displayName !== undefined) {
      data.displayName = dto.displayName;
    } else if (dto.firstName !== undefined || dto.lastName !== undefined) {
      data.displayName = this.resolveDisplayName({
        firstName: customer.firstName ?? undefined,
        lastName: customer.lastName ?? undefined,
        ...dto,
      });
    }

    if (dto.status !== undefined) data.status = dto.status;
    if (dto.source !== undefined) data.source = dto.source;
    if (dto.timeZone !== undefined) data.timeZone = dto.timeZone;

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.customer.update({
        where: { id: customerId },
        data,
        include: customerInclude,
      });

      await tx.customerActivity.create({
        data: {
          customerId,
          type: "customer_updated",
          performedBy: user.id,
          metadata: { fields: Object.keys(dto) },
        },
      });

      return updated;
    });
  }

  async deleteCustomer(user: AuthenticatedUser, customerId: string) {
    const customer = await this.getCustomerOrThrow(customerId);
    await this.assertCanManage(user.id, customer.shopId);

    await this.prisma.customer.update({
      where: { id: customerId },
      data: { status: CustomerStatus.INACTIVE, deletedAt: new Date() },
    });

    return { success: true };
  }

  async addNote(
    user: AuthenticatedUser,
    customerId: string,
    dto: CreateCustomerNoteDto,
  ) {
    const customer = await this.getCustomerOrThrow(customerId);
    await this.assertCanWrite(user.id, customer.shopId);

    return this.prisma.$transaction(async (tx) => {
      const note = await tx.customerNote.create({
        data: {
          customerId,
          authorId: user.id,
          note: dto.note,
          visibility: dto.visibility ?? CustomerNoteVisibility.INTERNAL,
        },
      });

      await tx.customerActivity.create({
        data: {
          customerId,
          type: "note_added",
          performedBy: user.id,
          metadata: { noteId: note.id, visibility: note.visibility },
        },
      });

      return note;
    });
  }

  async listNotes(user: AuthenticatedUser, customerId: string) {
    const customer = await this.getCustomerOrThrow(customerId);
    await this.assertCanRead(user.id, customer.shopId);
    const canManage = await this.permissions.canManageCustomers(
      user.id,
      customer.shopId,
    );

    return this.prisma.customerNote.findMany({
      where: {
        customerId,
        deletedAt: null,
        ...(canManage ? {} : { visibility: CustomerNoteVisibility.INTERNAL }),
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createGroup(
    user: AuthenticatedUser,
    shopId: string,
    dto: CreateCustomerGroupDto,
  ) {
    await this.assertCanManage(user.id, shopId);
    await this.assertUniqueGroupName(shopId, dto.name);

    const data: Prisma.CustomerGroupUncheckedCreateInput = {
      shopId,
      name: dto.name,
      status: dto.status ?? CustomerGroupStatus.ACTIVE,
    };
    if (dto.description !== undefined) data.description = dto.description;

    return this.prisma.customerGroup.create({ data });
  }

  async listGroups(user: AuthenticatedUser, shopId: string) {
    await this.assertCanRead(user.id, shopId);

    return this.prisma.customerGroup.findMany({
      where: { shopId, deletedAt: null },
      orderBy: { name: "asc" },
    });
  }

  async updateGroup(
    user: AuthenticatedUser,
    groupId: string,
    dto: UpdateCustomerGroupDto,
  ) {
    const group = await this.getGroupOrThrow(groupId);
    await this.assertCanManage(user.id, group.shopId);

    if (dto.name && dto.name !== group.name) {
      await this.assertUniqueGroupName(group.shopId, dto.name, groupId);
    }

    return this.prisma.customerGroup.update({
      where: { id: groupId },
      data: dto,
    });
  }

  async deleteGroup(user: AuthenticatedUser, groupId: string) {
    const group = await this.getGroupOrThrow(groupId);
    await this.assertCanManage(user.id, group.shopId);

    await this.prisma.customerGroup.update({
      where: { id: groupId },
      data: { status: CustomerGroupStatus.ARCHIVED, deletedAt: new Date() },
    });

    return { success: true };
  }

  async assignGroup(
    user: AuthenticatedUser,
    customerId: string,
    groupId: string,
  ) {
    const customer = await this.getCustomerOrThrow(customerId);
    const group = await this.getGroupOrThrow(groupId);
    this.assertSameShop(customer.shopId, group.shopId);
    await this.assertCanManage(user.id, customer.shopId);

    const existing = await this.prisma.customerGroupMember.findFirst({
      where: { customerId, groupId, deletedAt: null },
    });

    if (existing) return existing;

    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.customerGroupMember.create({
        data: { customerId, groupId },
      });

      await tx.customerActivity.create({
        data: {
          customerId,
          type: "group_assigned",
          performedBy: user.id,
          metadata: { groupId },
        },
      });

      return membership;
    });
  }

  async removeGroup(
    user: AuthenticatedUser,
    customerId: string,
    groupId: string,
  ) {
    const customer = await this.getCustomerOrThrow(customerId);
    const group = await this.getGroupOrThrow(groupId);
    this.assertSameShop(customer.shopId, group.shopId);
    await this.assertCanManage(user.id, customer.shopId);

    await this.prisma.customerGroupMember.updateMany({
      where: { customerId, groupId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  async createTag(
    user: AuthenticatedUser,
    shopId: string,
    dto: CreateCustomerTagDto,
  ) {
    await this.assertCanManage(user.id, shopId);
    await this.assertUniqueTagName(shopId, dto.name);

    const data: Prisma.CustomerTagUncheckedCreateInput = {
      shopId,
      name: dto.name,
      status: dto.status ?? CustomerTagStatus.ACTIVE,
    };
    if (dto.color !== undefined) data.color = dto.color;

    return this.prisma.customerTag.create({ data });
  }

  async listTags(user: AuthenticatedUser, shopId: string) {
    await this.assertCanRead(user.id, shopId);

    return this.prisma.customerTag.findMany({
      where: { shopId, deletedAt: null },
      orderBy: { name: "asc" },
    });
  }

  async updateTag(
    user: AuthenticatedUser,
    tagId: string,
    dto: UpdateCustomerTagDto,
  ) {
    const tag = await this.getTagOrThrow(tagId);
    await this.assertCanManage(user.id, tag.shopId);

    if (dto.name && dto.name !== tag.name) {
      await this.assertUniqueTagName(tag.shopId, dto.name, tagId);
    }

    return this.prisma.customerTag.update({
      where: { id: tagId },
      data: dto,
    });
  }

  async deleteTag(user: AuthenticatedUser, tagId: string) {
    const tag = await this.getTagOrThrow(tagId);
    await this.assertCanManage(user.id, tag.shopId);

    await this.prisma.customerTag.update({
      where: { id: tagId },
      data: { status: CustomerTagStatus.ARCHIVED, deletedAt: new Date() },
    });

    return { success: true };
  }

  async assignTag(user: AuthenticatedUser, customerId: string, tagId: string) {
    const customer = await this.getCustomerOrThrow(customerId);
    const tag = await this.getTagOrThrow(tagId);
    this.assertSameShop(customer.shopId, tag.shopId);
    await this.assertCanManage(user.id, customer.shopId);

    const existing = await this.prisma.customerTagAssignment.findFirst({
      where: { customerId, tagId, deletedAt: null },
    });

    if (existing) return existing;

    return this.prisma.$transaction(async (tx) => {
      const assignment = await tx.customerTagAssignment.create({
        data: { customerId, tagId },
      });

      await tx.customerActivity.create({
        data: {
          customerId,
          type: "tag_assigned",
          performedBy: user.id,
          metadata: { tagId },
        },
      });

      return assignment;
    });
  }

  async removeTag(user: AuthenticatedUser, customerId: string, tagId: string) {
    const customer = await this.getCustomerOrThrow(customerId);
    const tag = await this.getTagOrThrow(tagId);
    this.assertSameShop(customer.shopId, tag.shopId);
    await this.assertCanManage(user.id, customer.shopId);

    await this.prisma.customerTagAssignment.updateMany({
      where: { customerId, tagId, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  async listActivity(user: AuthenticatedUser, customerId: string) {
    const customer = await this.getCustomerOrThrow(customerId);
    await this.assertCanRead(user.id, customer.shopId);

    return this.prisma.customerActivity.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getLoyalty(user: AuthenticatedUser, customerId: string) {
    const customer = await this.getCustomerOrThrow(customerId);
    await this.assertCanRead(user.id, customer.shopId);

    return this.getOrCreateLoyalty(customerId);
  }

  async updateLoyalty(
    user: AuthenticatedUser,
    customerId: string,
    dto: UpdateCustomerLoyaltyDto,
  ) {
    const customer = await this.getCustomerOrThrow(customerId);
    await this.assertCanManage(user.id, customer.shopId);
    await this.getOrCreateLoyalty(customerId);

    return this.prisma.customerLoyaltyAccount.update({
      where: { customerId },
      data: dto,
    });
  }

  private async getCustomerOrThrow(customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
      include: customerInclude,
    });

    if (!customer) {
      throw new NotFoundException("Customer not found.");
    }

    return customer;
  }

  private async getGroupOrThrow(groupId: string) {
    const group = await this.prisma.customerGroup.findFirst({
      where: { id: groupId, deletedAt: null },
    });

    if (!group) throw new NotFoundException("Customer group not found.");
    return group;
  }

  private async getTagOrThrow(tagId: string) {
    const tag = await this.prisma.customerTag.findFirst({
      where: { id: tagId, deletedAt: null },
    });

    if (!tag) throw new NotFoundException("Customer tag not found.");
    return tag;
  }

  private async getOrCreateLoyalty(customerId: string) {
    return (
      (await this.prisma.customerLoyaltyAccount.findFirst({
        where: { customerId, deletedAt: null },
      })) ??
      (await this.prisma.customerLoyaltyAccount.create({
        data: {
          customerId,
          pointsBalance: 0,
          lifetimePoints: 0,
          tier: CustomerLoyaltyTier.BRONZE,
          status: CustomerLoyaltyStatus.ACTIVE,
        },
      }))
    );
  }

  private async assertCanRead(userId: string, shopId: string) {
    if (!(await this.permissions.canReadCustomers(userId, shopId))) {
      throw new ForbiddenException("You cannot read CRM data for this shop.");
    }
  }

  private async assertCanWrite(userId: string, shopId: string) {
    if (!(await this.permissions.canWriteCustomers(userId, shopId))) {
      throw new ForbiddenException("You cannot update CRM data for this shop.");
    }
  }

  private async assertCanManage(userId: string, shopId: string) {
    if (!(await this.permissions.canManageCustomers(userId, shopId))) {
      throw new ForbiddenException("You cannot manage CRM data for this shop.");
    }
  }

  private async assertUniqueContact(
    shopId: string,
    normalizedEmail?: string,
    normalizedPhone?: string,
    customerId?: string,
  ) {
    if (normalizedEmail) {
      const existing = await this.prisma.customer.findFirst({
        where: {
          shopId,
          normalizedEmail,
          deletedAt: null,
          ...(customerId ? { NOT: { id: customerId } } : {}),
        },
        select: { id: true },
      });

      if (existing) {
        throw new ConflictException("Customer email is already in use.");
      }
    }

    if (normalizedPhone) {
      const existing = await this.prisma.customer.findFirst({
        where: {
          shopId,
          normalizedPhone,
          deletedAt: null,
          ...(customerId ? { NOT: { id: customerId } } : {}),
        },
        select: { id: true },
      });

      if (existing) {
        throw new ConflictException("Customer phone is already in use.");
      }
    }
  }

  private async assertUniqueGroupName(
    shopId: string,
    name: string,
    groupId?: string,
  ) {
    const existing = await this.prisma.customerGroup.findFirst({
      where: {
        shopId,
        name,
        deletedAt: null,
        ...(groupId ? { NOT: { id: groupId } } : {}),
      },
      select: { id: true },
    });

    if (existing) throw new ConflictException("Customer group already exists.");
  }

  private async assertUniqueTagName(
    shopId: string,
    name: string,
    tagId?: string,
  ) {
    const existing = await this.prisma.customerTag.findFirst({
      where: {
        shopId,
        name,
        deletedAt: null,
        ...(tagId ? { NOT: { id: tagId } } : {}),
      },
      select: { id: true },
    });

    if (existing) throw new ConflictException("Customer tag already exists.");
  }

  private assertSameShop(leftShopId: string, rightShopId: string) {
    if (leftShopId !== rightShopId) {
      throw new ForbiddenException("CRM records belong to different shops.");
    }
  }

  private normalizeEmail(email?: string) {
    return email ? email.trim().toLowerCase() : undefined;
  }

  private normalizePhone(phone?: string) {
    return phone ? phone.replace(/[^\d+]/g, "") : undefined;
  }

  private resolveDisplayName(dto: {
    displayName?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
  }) {
    const composed = [dto.firstName, dto.lastName].filter(Boolean).join(" ");
    return dto.displayName ?? (composed || "Customer");
  }

  private applyCustomerFields(
    data: Prisma.CustomerCreateInput | Prisma.CustomerUpdateInput,
    dto: CreateCustomerDto | UpdateCustomerDto,
    normalizedEmail?: string,
    normalizedPhone?: string,
  ) {
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.email !== undefined) {
      data.email = dto.email;
      data.normalizedEmail = normalizedEmail ?? null;
    }
    if (dto.phone !== undefined) {
      data.phone = dto.phone;
      data.normalizedPhone = normalizedPhone ?? null;
    }
    if (dto.birthDate !== undefined) data.birthDate = dto.birthDate;
    if (dto.gender !== undefined) data.gender = dto.gender;
    if (dto.preferredLocale !== undefined) {
      data.locale = dto.preferredLocale
        ? { connect: { code: dto.preferredLocale } }
        : { disconnect: true };
    }
    if (dto.preferredCurrency !== undefined) {
      data.currency = dto.preferredCurrency
        ? { connect: { code: dto.preferredCurrency } }
        : { disconnect: true };
    }
    if (dto.countryCode !== undefined) {
      data.country = dto.countryCode
        ? { connect: { code: dto.countryCode } }
        : { disconnect: true };
    }
  }
}
