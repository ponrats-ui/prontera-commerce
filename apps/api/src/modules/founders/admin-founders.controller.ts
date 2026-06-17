import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import {
  ListFounderApplicationsQueryDto,
  ReviewFounderApplicationDto,
} from "./dto/founder-application.dto";
import { FoundersService } from "./founders.service";

@ApiTags("Admin Founder Merchants")
@ApiBearerAuth()
@Roles("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("admin/founders")
export class AdminFoundersController {
  constructor(private readonly founders: FoundersService) {}

  @Get()
  @ApiOperation({ summary: "Review Founder Merchant applications" })
  list(@Query() query: ListFounderApplicationsQueryDto) {
    return this.founders.listApplications(query.status);
  }

  @Get("campaign-metrics")
  @ApiOperation({ summary: "Get Founder launch campaign metrics" })
  campaignMetrics() {
    return this.founders.metrics();
  }

  @Patch(":id/approve")
  @ApiOperation({ summary: "Approve a Founder Merchant application" })
  @ApiBody({ type: ReviewFounderApplicationDto })
  approve(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: ReviewFounderApplicationDto,
  ) {
    return this.founders.approve(user, id, dto);
  }

  @Patch(":id/reject")
  @ApiOperation({ summary: "Reject a Founder Merchant application" })
  @ApiBody({ type: ReviewFounderApplicationDto })
  reject(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: ReviewFounderApplicationDto,
  ) {
    return this.founders.reject(user, id, dto);
  }
}
