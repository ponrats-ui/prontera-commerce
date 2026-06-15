import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { POSSessionStatus, POSShiftStatus, Prisma } from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import type { ClosePOSDto, OpenPOSDto } from "./dto/pos.dto";
import { OrderPermissionsService } from "./order-permissions.service";

const posInclude = {
  shifts: { where: { deletedAt: null }, orderBy: { openedAt: "desc" } },
} satisfies Prisma.POSSessionInclude;

@Injectable()
export class POSService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: OrderPermissionsService,
  ) {}

  async open(user: AuthenticatedUser, dto: OpenPOSDto) {
    if (!(await this.permissions.canCreateTransaction(user.id, dto.shopId))) {
      throw new ForbiddenException("You cannot open POS for this shop.");
    }

    const existing = await this.prisma.pOSSession.findFirst({
      where: {
        shopId: dto.shopId,
        cashierId: user.id,
        status: POSSessionStatus.OPEN,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException("POS session is already open.");
    }

    return this.prisma.pOSSession.create({
      data: {
        shopId: dto.shopId,
        cashierId: user.id,
        openingCash: dto.openingCash,
        status: POSSessionStatus.OPEN,
        shifts: {
          create: {
            shopId: dto.shopId,
            cashierId: user.id,
            openingCash: dto.openingCash,
            status: POSShiftStatus.OPEN,
          },
        },
      },
      include: posInclude,
    });
  }

  async close(user: AuthenticatedUser, dto: ClosePOSDto) {
    const session = await this.prisma.pOSSession.findFirst({
      where: { id: dto.sessionId, deletedAt: null },
      include: posInclude,
    });

    if (!session) {
      throw new NotFoundException("POS session not found.");
    }

    if (
      !(await this.permissions.canCreateTransaction(user.id, session.shopId))
    ) {
      throw new ForbiddenException("You cannot close this POS session.");
    }

    if (session.status !== POSSessionStatus.OPEN) {
      throw new BadRequestException("POS session is already closed.");
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.pOSShift.updateMany({
        where: {
          posSessionId: session.id,
          status: POSShiftStatus.OPEN,
          deletedAt: null,
        },
        data: {
          status: POSShiftStatus.CLOSED,
          closedAt: new Date(),
          closingCash: dto.closingCash,
        },
      });

      return tx.pOSSession.update({
        where: { id: session.id },
        data: {
          status: POSSessionStatus.CLOSED,
          closedAt: new Date(),
          closingCash: dto.closingCash,
        },
        include: posInclude,
      });
    });
  }

  async current(user: AuthenticatedUser, shopId: string) {
    if (!(await this.permissions.canCreateTransaction(user.id, shopId))) {
      throw new ForbiddenException("You cannot read POS for this shop.");
    }

    return this.prisma.pOSSession.findFirst({
      where: {
        shopId,
        cashierId: user.id,
        status: POSSessionStatus.OPEN,
        deletedAt: null,
      },
      include: posInclude,
      orderBy: { openedAt: "desc" },
    });
  }
}
