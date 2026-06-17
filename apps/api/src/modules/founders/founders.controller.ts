import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import {
  CreateFounderApplicationDto,
  FounderCampaignEventDto,
  FounderReferralDto,
  FounderWaitlistDto,
} from "./dto/founder-application.dto";
import { FoundersService } from "./founders.service";

@ApiTags("Founder Merchant Program")
@Controller("founders")
export class FoundersController {
  constructor(private readonly founders: FoundersService) {}

  @Get("metrics")
  @ApiOperation({ summary: "Get public Founder Merchant counter metrics" })
  metrics() {
    return this.founders.metrics();
  }

  @Get("campaign")
  @ApiOperation({ summary: "Get Founder launch campaign dashboard metrics" })
  campaign() {
    return this.founders.metrics();
  }

  @Post("applications")
  @ApiOperation({ summary: "Submit a Founder Merchant application" })
  @ApiBody({ type: CreateFounderApplicationDto })
  apply(@Body() dto: CreateFounderApplicationDto) {
    return this.founders.apply(dto);
  }

  @Post("waitlist")
  @ApiOperation({ summary: "Join the Founder launch waitlist" })
  @ApiBody({ type: FounderWaitlistDto })
  waitlist(@Body() dto: FounderWaitlistDto) {
    return this.founders.joinWaitlist(dto);
  }

  @Post("referrals")
  @ApiOperation({ summary: "Capture a Founder launch referral" })
  @ApiBody({ type: FounderReferralDto })
  refer(@Body() dto: FounderReferralDto) {
    return this.founders.refer(dto);
  }

  @Post("campaign-events")
  @ApiOperation({ summary: "Track a Founder launch campaign event" })
  @ApiBody({ type: FounderCampaignEventDto })
  track(@Body() dto: FounderCampaignEventDto) {
    return this.founders.track(dto);
  }

  @Get("me")
  @ApiBearerAuth()
  @Roles("admin", "merchant")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Get current merchant Founder status" })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.founders.getMyFounderStatus(user);
  }
}
