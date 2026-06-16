import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { GrantFounderMerchantDto } from "./dto/subscription.dto";
import { SubscriptionsService } from "./subscriptions.service";

@ApiTags("Admin Subscriptions")
@ApiBearerAuth()
@Roles("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin/subscriptions")
export class AdminSubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionsService) {}

  @Post("founders")
  @ApiOperation({ summary: "Grant Founder Merchant program access" })
  @ApiBody({ type: GrantFounderMerchantDto })
  grantFounder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: GrantFounderMerchantDto,
  ) {
    return this.subscriptions.grantFounder(user, dto);
  }
}
