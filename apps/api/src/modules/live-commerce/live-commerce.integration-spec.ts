import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  LiveChannelProvider,
  LiveChannelStatus,
  ShopStaffRole,
  SubscriptionPlanType,
  SubscriptionStatus,
} from "@prisma/client";
import request from "supertest";
import type { AuthenticatedUser } from "../auth/auth.types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { PrismaService } from "../database/prisma.service";
import { LiveCommerceModule } from "./live-commerce.module";

const shopId = "11111111-1111-4111-8111-111111111111";
const liveChannelId = "22222222-2222-4222-8222-222222222222";
const otherLiveChannelId = "33333333-3333-4333-8333-333333333333";

const ownerUser: AuthenticatedUser = {
  id: "owner-1",
  email: "owner@example.com",
  roles: ["merchant"],
  sessionId: "session-1",
};

const liveChannel = {
  id: liveChannelId,
  shopId,
  provider: LiveChannelProvider.YOUTUBE,
  title: "Live Demo",
  description: null,
  videoUrl: "https://youtu.be/VIDEO_ID",
  embedUrl: "https://www.youtube.com/embed/VIDEO_ID",
  thumbnailUrl: null,
  status: LiveChannelStatus.DRAFT,
  startsAt: null,
  endsAt: null,
  createdById: ownerUser.id,
  createdAt: new Date("2026-06-15T00:00:00.000Z"),
  updatedAt: new Date("2026-06-15T00:00:00.000Z"),
  deletedAt: null,
};

type LiveChannelMock = Omit<typeof liveChannel, "status"> & {
  status: LiveChannelStatus;
};

function createPrismaMock(getPlanCode: () => string) {
  let existingLiveChannel: LiveChannelMock | null = null;

  return {
    setExistingLiveChannel: (channel: LiveChannelMock | null) => {
      existingLiveChannel = channel;
    },
    shop: {
      findFirst: jest.fn().mockResolvedValue({
        ownerId: ownerUser.id,
        staff: [{ role: ShopStaffRole.OWNER }],
      }),
    },
    founderMerchantProgram: {
      findFirst: jest.fn().mockResolvedValue(null),
    },
    merchantSubscription: {
      findFirst: jest.fn(() =>
        Promise.resolve({
          status: SubscriptionStatus.ACTIVE,
          plan: {
            code: getPlanCode(),
            planType:
              getPlanCode() === "STARTER"
                ? SubscriptionPlanType.STARTER
                : SubscriptionPlanType.PRO,
          },
        }),
      ),
    },
    subscription: {
      findFirst: jest.fn(() =>
        Promise.resolve({
          status: SubscriptionStatus.ACTIVE,
          plan: { code: getPlanCode() },
        }),
      ),
    },
    shopLiveChannel: {
      create: jest.fn((args) =>
        Promise.resolve({
          ...liveChannel,
          ...args.data,
        }),
      ),
      findMany: jest.fn().mockResolvedValue([liveChannel]),
      findFirst: jest.fn((args) => {
        if (args.where?.id === liveChannelId) {
          return Promise.resolve(liveChannel);
        }

        if (args.where?.status === LiveChannelStatus.LIVE) {
          return Promise.resolve(existingLiveChannel);
        }

        return Promise.resolve(null);
      }),
      update: jest.fn((args) =>
        Promise.resolve({
          ...liveChannel,
          ...args.data,
        }),
      ),
    },
  };
}

describe("LiveCommerceController (integration)", () => {
  let app: INestApplication;
  let planCode = "PRO";
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(async () => {
    planCode = "PRO";
    prisma = createPrismaMock(() => planCode);

    const moduleRef = await Test.createTestingModule({
      imports: [LiveCommerceModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => { user: AuthenticatedUser } };
        }) => {
          context.switchToHttp().getRequest().user = ownerUser;
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("creates a YouTube live channel", async () => {
    const response = await request(app.getHttpServer())
      .post(`/shops/${shopId}/live-channels`)
      .send({
        title: "Live Demo",
        videoUrl: "https://www.youtube.com/watch?v=VIDEO_ID",
      })
      .expect(201);

    expect(response.body.embedUrl).toBe(
      "https://www.youtube.com/embed/VIDEO_ID",
    );
  });

  it("rejects invalid YouTube URLs", async () => {
    await request(app.getHttpServer())
      .post(`/shops/${shopId}/live-channels`)
      .send({
        title: "Bad Demo",
        videoUrl: "https://example.com/video",
      })
      .expect(400);
  });

  it("rejects Starter plan shops", async () => {
    planCode = "STARTER";

    const response = await request(app.getHttpServer())
      .post(`/shops/${shopId}/live-channels`)
      .send({
        title: "Starter Demo",
        videoUrl: "https://youtu.be/VIDEO_ID",
      })
      .expect(403);

    expect(response.body.message).toBe(
      "Live Commerce is available on Pro plan and above.",
    );
  });

  it("sets a channel live and ends it", async () => {
    await request(app.getHttpServer())
      .post(`/live-channels/${liveChannelId}/go-live`)
      .expect(201);

    await request(app.getHttpServer())
      .post(`/live-channels/${liveChannelId}/end`)
      .expect(201);
  });

  it("prevents multiple active live channels", async () => {
    prisma.setExistingLiveChannel({
      ...liveChannel,
      id: otherLiveChannelId,
      status: LiveChannelStatus.LIVE,
    });

    await request(app.getHttpServer())
      .post(`/live-channels/${liveChannelId}/go-live`)
      .expect(409);
  });
});
