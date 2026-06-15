import {
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import {
  LiveChannelProvider,
  LiveChannelStatus,
  SubscriptionStatus,
} from "@prisma/client";
import type { AuthenticatedUser } from "../auth/auth.types";
import { LiveCommercePermissionsService } from "./live-commerce-permissions.service";
import { LiveCommercePlanAccessService } from "./live-commerce-plan-access.service";
import { LiveCommerceService } from "./live-commerce.service";

const user: AuthenticatedUser = {
  id: "user-1",
  email: "owner@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

const channel = {
  id: "channel-1",
  shopId: "shop-1",
  provider: LiveChannelProvider.YOUTUBE,
  title: "Live Demo",
  description: null,
  videoUrl: "https://youtu.be/VIDEO_ID",
  embedUrl: "https://www.youtube.com/embed/VIDEO_ID",
  thumbnailUrl: null,
  status: LiveChannelStatus.DRAFT,
  startsAt: null,
  endsAt: null,
  createdById: user.id,
  deletedAt: null,
};

function createPrismaMock() {
  return {
    subscription: {
      findFirst: jest.fn().mockResolvedValue({
        status: SubscriptionStatus.ACTIVE,
        plan: { code: "PRO" },
      }),
    },
    shopLiveChannel: {
      create: jest.fn().mockResolvedValue(channel),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([channel]),
      update: jest.fn().mockResolvedValue({
        ...channel,
        status: LiveChannelStatus.LIVE,
      }),
    },
  };
}

describe("LiveCommerceService", () => {
  it("creates a YouTube live channel with an embed URL", async () => {
    const prisma = createPrismaMock();
    const permissions = {
      canReadLiveCommerce: jest.fn(),
      canManageLiveCommerce: jest.fn().mockResolvedValue(true),
    };
    const service = new LiveCommerceService(
      prisma as never,
      permissions as unknown as LiveCommercePermissionsService,
      new LiveCommercePlanAccessService(prisma as never),
    );

    await service.createChannel(user, "shop-1", {
      title: "Live Demo",
      videoUrl: "https://www.youtube.com/watch?v=VIDEO_ID",
    });

    expect(prisma.shopLiveChannel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          embedUrl: "https://www.youtube.com/embed/VIDEO_ID",
          status: LiveChannelStatus.DRAFT,
        }),
      }),
    );
  });

  it("rejects invalid YouTube URLs", async () => {
    const prisma = createPrismaMock();
    const service = new LiveCommerceService(
      prisma as never,
      {
        canReadLiveCommerce: jest.fn(),
        canManageLiveCommerce: jest.fn().mockResolvedValue(true),
      } as never,
      new LiveCommercePlanAccessService(prisma as never),
    );

    await expect(
      service.createChannel(user, "shop-1", {
        title: "Bad Demo",
        videoUrl: "https://example.com/video",
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("blocks Starter shops from creating live channels", async () => {
    const prisma = createPrismaMock();
    prisma.subscription.findFirst.mockResolvedValue({
      status: SubscriptionStatus.ACTIVE,
      plan: { code: "STARTER" },
    });
    const service = new LiveCommerceService(
      prisma as never,
      {
        canReadLiveCommerce: jest.fn(),
        canManageLiveCommerce: jest.fn().mockResolvedValue(true),
      } as never,
      new LiveCommercePlanAccessService(prisma as never),
    );

    await expect(
      service.createChannel(user, "shop-1", {
        title: "Starter Demo",
        videoUrl: "https://youtu.be/VIDEO_ID",
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it("prevents multiple active live channels", async () => {
    const prisma = createPrismaMock();
    prisma.shopLiveChannel.findFirst.mockResolvedValueOnce(channel);
    const service = new LiveCommerceService(
      prisma as never,
      {
        canReadLiveCommerce: jest.fn(),
        canManageLiveCommerce: jest.fn().mockResolvedValue(true),
      } as never,
      new LiveCommercePlanAccessService(prisma as never),
    );

    await expect(
      service.createChannel(user, "shop-1", {
        title: "Second Demo",
        videoUrl: "https://youtu.be/VIDEO_ID_2",
        status: LiveChannelStatus.LIVE,
      }),
    ).rejects.toThrow(ConflictException);
  });
});
