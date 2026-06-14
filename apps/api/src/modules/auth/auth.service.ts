import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma, UserStatus } from "@prisma/client";
import * as argon2 from "argon2";
import { randomUUID } from "crypto";
import { PrismaService } from "../database/prisma.service";
import type {
  AuthenticatedUser,
  JwtAccessPayload,
  JwtRefreshPayload,
} from "./auth.types";
import type { AuthResponseDto, AuthUserDto } from "./dto/auth-response.dto";
import type { LoginDto } from "./dto/login.dto";
import type { RefreshTokenDto } from "./dto/refresh-token.dto";
import type { RegisterDto } from "./dto/register.dto";

type RequestContext = {
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
};

const authUserInclude = {
  roles: {
    where: { deletedAt: null },
    include: { role: true },
  },
} satisfies Prisma.UserInclude;

type UserWithRoles = Prisma.UserGetPayload<{ include: typeof authUserInclude }>;

function accessTokenSecret() {
  return process.env.JWT_ACCESS_SECRET ?? "dev-access-secret-change-me";
}

function refreshTokenSecret() {
  return process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret-change-me";
}

function accessTokenTtl() {
  return process.env.JWT_ACCESS_TTL ?? "15m";
}

function refreshTokenDays() {
  return Number(process.env.JWT_REFRESH_DAYS ?? 30);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterDto,
    context: RequestContext = {},
  ): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: { equals: dto.email, mode: "insensitive" },
        deletedAt: null,
      },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException("Email is already registered.");
    }

    const passwordHash = await this.hashSecret(dto.password);
    const roleCode = "merchant";

    const user = await this.prisma.$transaction(async (tx) => {
      const role =
        (await tx.role.findFirst({
          where: {
            code: roleCode,
            deletedAt: null,
          },
        })) ??
        (await tx.role.create({
          data: {
            code: roleCode,
            name: this.formatRoleName(roleCode),
          },
        }));

      const userCreateData: Prisma.UserCreateInput = {
        email: dto.email,
        passwordHash,
        timeZone: dto.timezone ?? "UTC",
        roles: {
          create: {
            roleId: role.id,
          },
        },
      };

      if (dto.name) {
        userCreateData.name = dto.name;
      }

      if (dto.countryCode) {
        userCreateData.country = { connect: { code: dto.countryCode } };
      }

      if (dto.preferredLocale) {
        userCreateData.locale = { connect: { code: dto.preferredLocale } };
        userCreateData.preferredLocaleRef = {
          connect: { code: dto.preferredLocale },
        };
      }

      if (dto.preferredCurrency) {
        userCreateData.preferredCurrencyRef = {
          connect: { code: dto.preferredCurrency },
        };
      }

      const createdUser = await tx.user.create({
        data: userCreateData,
        include: authUserInclude,
      });

      return createdUser;
    });

    return this.createAuthResponse(user, context);
  }

  async login(
    dto: LoginDto,
    context: RequestContext = {},
  ): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: dto.email, mode: "insensitive" },
        deletedAt: null,
      },
      include: authUserInclude,
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const passwordMatches = await argon2.verify(
      user.passwordHash,
      dto.password,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    return this.createAuthResponse(user, context);
  }

  async logout(user: AuthenticatedUser): Promise<{ success: true }> {
    await this.prisma.session.updateMany({
      where: {
        id: user.sessionId,
        userId: user.id,
        revokedAt: null,
        deletedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return { success: true };
  }

  async refresh(
    dto: RefreshTokenDto,
    context: RequestContext = {},
  ): Promise<AuthResponseDto> {
    let payload: JwtRefreshPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(
        dto.refreshToken,
        {
          secret: refreshTokenSecret(),
        },
      );
    } catch {
      throw new UnauthorizedException("Invalid refresh token.");
    }

    if (payload.typ !== "refresh") {
      throw new UnauthorizedException("Invalid refresh token.");
    }

    const session = await this.prisma.session.findFirst({
      where: {
        id: payload.sid,
        userId: payload.sub,
        revokedAt: null,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: { include: authUserInclude },
      },
    });

    if (!session || session.user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException("Invalid refresh token.");
    }

    const tokenMatches = await argon2.verify(
      session.refreshTokenHash,
      dto.refreshToken,
    );

    if (!tokenMatches) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException("Invalid refresh token.");
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        revokedAt: new Date(),
        lastUsedAt: new Date(),
      },
    });

    return this.createAuthResponse(session.user, context);
  }

  async getCurrentUser(user: AuthenticatedUser): Promise<AuthUserDto> {
    const dbUser = await this.prisma.user.findFirst({
      where: {
        id: user.id,
        status: UserStatus.ACTIVE,
        deletedAt: null,
        sessions: {
          some: {
            id: user.sessionId,
            revokedAt: null,
            deletedAt: null,
            expiresAt: { gt: new Date() },
          },
        },
      },
      include: authUserInclude,
    });

    if (!dbUser) {
      throw new UnauthorizedException("Session is no longer active.");
    }

    return this.toAuthUser(dbUser);
  }

  private async createAuthResponse(
    user: UserWithRoles,
    context: RequestContext,
  ): Promise<AuthResponseDto> {
    const sessionId = randomUUID();
    const roles = user.roles.map((userRole) => userRole.role.code);
    const refreshTokenExpiresAt = new Date(
      Date.now() + refreshTokenDays() * 24 * 60 * 60 * 1000,
    );

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        roles,
        sid: sessionId,
        typ: "access",
      } satisfies JwtAccessPayload,
      {
        secret: accessTokenSecret(),
        expiresIn: accessTokenTtl(),
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        sid: sessionId,
        typ: "refresh",
      } satisfies JwtRefreshPayload,
      {
        secret: refreshTokenSecret(),
        expiresIn: `${refreshTokenDays()}d`,
      },
    );

    const sessionCreateData: Prisma.SessionUncheckedCreateInput = {
      id: sessionId,
      userId: user.id,
      refreshTokenHash: await this.hashSecret(refreshToken),
      expiresAt: refreshTokenExpiresAt,
    };

    if (context.userAgent) {
      sessionCreateData.userAgent = context.userAgent;
    }

    if (context.ipAddress) {
      sessionCreateData.ipAddress = context.ipAddress;
    }

    await this.prisma.session.create({
      data: sessionCreateData,
    });

    return {
      accessToken,
      refreshToken,
      user: this.toAuthUser(user),
    };
  }

  private toAuthUser(user: UserWithRoles): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles.map((userRole) => userRole.role.code),
      preferredLocale: user.preferredLocale,
      preferredCurrency: user.preferredCurrency,
      countryCode: user.countryCode,
      timezone: user.timeZone,
    };
  }

  private hashSecret(secret: string) {
    return argon2.hash(secret, {
      type: argon2.argon2id,
      memoryCost: 65_536,
      timeCost: 3,
      parallelism: 1,
    });
  }

  private formatRoleName(roleCode: string) {
    return roleCode
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
}
