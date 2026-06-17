import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import {
  PublishMerchantOnboardingDto,
  StartMerchantOnboardingDto,
} from "./dto/merchant-onboarding.dto";
import { MerchantOnboardingService } from "./merchant-onboarding.service";

@ApiTags("Merchant Onboarding")
@ApiBearerAuth()
@Roles("admin", "merchant")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("merchant-onboarding")
export class MerchantOnboardingController {
  constructor(
    private readonly merchantOnboardingService: MerchantOnboardingService,
  ) {}

  @Post("start")
  @ApiOperation({ summary: "Start merchant onboarding" })
  @ApiBody({ type: StartMerchantOnboardingDto })
  start(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StartMerchantOnboardingDto,
  ) {
    return this.merchantOnboardingService.start(user, dto);
  }

  @Post("publish")
  @ApiOperation({ summary: "Publish a shop into the Prontera world" })
  @ApiBody({ type: PublishMerchantOnboardingDto })
  publish(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PublishMerchantOnboardingDto,
  ) {
    return this.merchantOnboardingService.publish(user, dto);
  }

  @Get("status")
  @ApiOperation({ summary: "Get merchant onboarding status" })
  status(@CurrentUser() user: AuthenticatedUser) {
    return this.merchantOnboardingService.status(user);
  }
}
