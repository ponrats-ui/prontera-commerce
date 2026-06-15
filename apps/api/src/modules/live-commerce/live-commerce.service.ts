import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  LiveChannelProvider,
  LiveChannelStatus,
  Prisma,
} from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { PrismaService } from "../database/prisma.service";
import type {
  CreateLiveChannelDto,
  UpdateLiveChannelDto,
} from "./dto/live-channel.dto";
import { LiveCommercePermissionsService } from "./live-commerce-permissions.service";
import {
  LiveCommercePlanAccessService,
  liveCommercePlanCodes,
} from "./live-commerce-plan-access.service";
import { buildYouTubeEmbedUrl, parseYouTubeVideoId } from "./youtube-url.util";

const LIVE_COMMERCE_PLAN_MESSAGE =
  "Live Commerce is available on Pro plan and above.";

const liveChannelInclude = {
  shop: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  createdBy: {
    select: {
      id: true,
      email: true,
      name: true,
    },
  },
} satisfies Prisma.ShopLiveChannelInclude;

@Injectable()
export class LiveCommerceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: LiveCommercePermissionsService,
    private readonly planAccess: LiveCommercePlanAccessService,
  ) {}

  async getAccess(user: AuthenticatedUser, shopId: string) {
    await this.assertCanRead(user.id, shopId);

    return {
      canUseLiveCommerce: await this.planAccess.canUseLiveCommerce(shopId),
      minimumPlan: liveCommercePlanCodes.minimum,
    };
  }

  async createChannel(
    user: AuthenticatedUser,
    shopId: string,
    dto: CreateLiveChannelDto,
  ) {
    await this.assertCanManage(user.id, shopId);
    await this.assertPlanAccess(shopId);

    const provider = dto.provider ?? LiveChannelProvider.YOUTUBE;
    const embedUrl = this.buildEmbedUrl(provider, dto.videoUrl);

    if ((dto.status ?? LiveChannelStatus.DRAFT) === LiveChannelStatus.LIVE) {
      await this.assertNoLiveChannel(shopId);
    }

    return this.prisma.shopLiveChannel.create({
      data: {
        shopId,
        provider,
        title: dto.title,
        description: dto.description ?? null,
        videoUrl: dto.videoUrl,
        embedUrl,
        thumbnailUrl: dto.thumbnailUrl ?? null,
        status: dto.status ?? LiveChannelStatus.DRAFT,
        startsAt: dto.startsAt ?? null,
        endsAt: dto.endsAt ?? null,
        createdById: user.id,
      },
      include: liveChannelInclude,
    });
  }

  async listChannels(user: AuthenticatedUser, shopId: string) {
    await this.assertCanRead(user.id, shopId);

    return this.prisma.shopLiveChannel.findMany({
      where: { shopId, deletedAt: null },
      include: liveChannelInclude,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });
  }

  async getActiveChannel(user: AuthenticatedUser, shopId: string) {
    await this.assertCanRead(user.id, shopId);

    return this.prisma.shopLiveChannel.findFirst({
      where: {
        shopId,
        status: LiveChannelStatus.LIVE,
        deletedAt: null,
      },
      include: liveChannelInclude,
      orderBy: { updatedAt: "desc" },
    });
  }

  async getChannel(user: AuthenticatedUser, id: string) {
    const channel = await this.getChannelOrThrow(id);
    await this.assertCanRead(user.id, channel.shopId);
    return channel;
  }

  async updateChannel(
    user: AuthenticatedUser,
    id: string,
    dto: UpdateLiveChannelDto,
  ) {
    const channel = await this.getChannelOrThrow(id);
    await this.assertCanManage(user.id, channel.shopId);

    if (dto.status === LiveChannelStatus.LIVE) {
      await this.assertPlanAccess(channel.shopId);
      await this.assertNoLiveChannel(channel.shopId, id);
    }

    const provider = dto.provider ?? channel.provider;
    const videoUrl = dto.videoUrl ?? channel.videoUrl;
    const data: Prisma.ShopLiveChannelUpdateInput = {};

    if (dto.provider !== undefined) {
      data.provider = dto.provider;
    }

    if (dto.videoUrl !== undefined || dto.provider !== undefined) {
      data.videoUrl = videoUrl;
      data.embedUrl = this.buildEmbedUrl(provider, videoUrl);
    }

    if (dto.title !== undefined) {
      data.title = dto.title;
    }

    if (dto.description !== undefined) {
      data.description = dto.description ?? null;
    }

    if (dto.thumbnailUrl !== undefined) {
      data.thumbnailUrl = dto.thumbnailUrl ?? null;
    }

    if (dto.status !== undefined) {
      data.status = dto.status;
      if (dto.status === LiveChannelStatus.LIVE && channel.startsAt === null) {
        data.startsAt = new Date();
      }
      if (dto.status === LiveChannelStatus.ENDED) {
        data.endsAt = new Date();
      }
    }

    if (dto.startsAt !== undefined) {
      data.startsAt = dto.startsAt ?? null;
    }

    if (dto.endsAt !== undefined) {
      data.endsAt = dto.endsAt ?? null;
    }

    return this.prisma.shopLiveChannel.update({
      where: { id },
      data,
      include: liveChannelInclude,
    });
  }

  async deleteChannel(user: AuthenticatedUser, id: string) {
    const channel = await this.getChannelOrThrow(id);
    await this.assertCanManage(user.id, channel.shopId);

    await this.prisma.shopLiveChannel.update({
      where: { id },
      data: {
        status: LiveChannelStatus.DISABLED,
        deletedAt: new Date(),
      },
    });

    return { success: true };
  }

  async goLive(user: AuthenticatedUser, id: string) {
    const channel = await this.getChannelOrThrow(id);
    await this.assertCanManage(user.id, channel.shopId);
    await this.assertPlanAccess(channel.shopId);
    await this.assertNoLiveChannel(channel.shopId, id);

    return this.prisma.shopLiveChannel.update({
      where: { id },
      data: {
        status: LiveChannelStatus.LIVE,
        startsAt: channel.startsAt ?? new Date(),
        endsAt: null,
      },
      include: liveChannelInclude,
    });
  }

  async endLive(user: AuthenticatedUser, id: string) {
    const channel = await this.getChannelOrThrow(id);
    await this.assertCanManage(user.id, channel.shopId);

    return this.prisma.shopLiveChannel.update({
      where: { id },
      data: {
        status: LiveChannelStatus.ENDED,
        endsAt: new Date(),
      },
      include: liveChannelInclude,
    });
  }

  private async getChannelOrThrow(id: string) {
    const channel = await this.prisma.shopLiveChannel.findFirst({
      where: { id, deletedAt: null },
      include: liveChannelInclude,
    });

    if (!channel) {
      throw new NotFoundException("Live channel not found");
    }

    return channel;
  }

  private buildEmbedUrl(provider: LiveChannelProvider, videoUrl: string) {
    if (provider !== LiveChannelProvider.YOUTUBE) {
      throw new BadRequestException(
        "Only YouTube live channels are supported in this sprint.",
      );
    }

    const videoId = parseYouTubeVideoId(videoUrl);

    if (!videoId) {
      throw new BadRequestException("Invalid YouTube URL.");
    }

    return buildYouTubeEmbedUrl(videoId);
  }

  private async assertPlanAccess(shopId: string) {
    if (!(await this.planAccess.canUseLiveCommerce(shopId))) {
      throw new ForbiddenException(LIVE_COMMERCE_PLAN_MESSAGE);
    }
  }

  private async assertNoLiveChannel(shopId: string, exceptId?: string) {
    const existing = await this.prisma.shopLiveChannel.findFirst({
      where: {
        shopId,
        status: LiveChannelStatus.LIVE,
        deletedAt: null,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException("Shop already has an active live channel.");
    }
  }

  private async assertCanRead(userId: string, shopId: string) {
    if (!(await this.permissions.canReadLiveCommerce(userId, shopId))) {
      throw new ForbiddenException("You do not have access to this shop.");
    }
  }

  private async assertCanManage(userId: string, shopId: string) {
    if (!(await this.permissions.canManageLiveCommerce(userId, shopId))) {
      throw new ForbiddenException(
        "Only shop owners and managers can manage live commerce.",
      );
    }
  }
}

export { LIVE_COMMERCE_PLAN_MESSAGE };
