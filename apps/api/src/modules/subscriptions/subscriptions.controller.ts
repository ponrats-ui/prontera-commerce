import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import {
  CancelSubscriptionDto,
  UpgradeSubscriptionDto,
} from "./dto/subscription.dto";
import { SubscriptionsService } from "./subscriptions.service";

@ApiTags("Subscriptions")
@ApiBearerAuth()
@Roles("admin", "merchant")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Get("plans")
  @ApiOperation({ summary: "List merchant subscription plans" })
  plans() {
    return this.subscriptions.listPlans();
  }

  @Get("me")
  @ApiOperation({ summary: "Get current merchant subscription state" })
  me(@CurrentUser() user: AuthenticatedUser, @Query("shopId") shopId?: string) {
    return this.subscriptions.getMySubscription(user, shopId);
  }

  @Post("upgrade")
  @ApiOperation({ summary: "Upgrade a merchant subscription" })
  @ApiBody({ type: UpgradeSubscriptionDto })
  upgrade(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpgradeSubscriptionDto,
  ) {
    return this.subscriptions.upgrade(user, dto);
  }

  @Post("cancel")
  @ApiOperation({ summary: "Cancel paid subscription and return to Starter" })
  @ApiBody({ type: CancelSubscriptionDto })
  cancel(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CancelSubscriptionDto,
  ) {
    return this.subscriptions.cancel(user, dto.shopId);
  }

  @Get("founder")
  @ApiOperation({ summary: "Get founder merchant program status" })
  founder(
    @CurrentUser() user: AuthenticatedUser,
    @Query("shopId") shopId?: string,
  ) {
    return this.subscriptions.getFounder(user, shopId);
  }
}
