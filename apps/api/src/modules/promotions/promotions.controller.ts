import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
  CreatePricingTierDto,
  CreatePromotionCampaignDto,
  CreateVoucherDto,
  EvaluatePromotionsDto,
  UpdatePricingTierDto,
  UpdatePromotionCampaignDto,
  UpdateVoucherDto,
} from "./dto/promotion.dto";
import { PromotionEngineService } from "./promotion-engine.service";

@ApiTags("Promotions")
@ApiBearerAuth()
@Roles("admin", "merchant")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("promotions")
export class PromotionsController {
  constructor(private readonly promotions: PromotionEngineService) {}

  @Post("campaigns")
  @ApiOperation({ summary: "Create a promotion campaign" })
  @ApiBody({ type: CreatePromotionCampaignDto })
  createCampaign(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePromotionCampaignDto,
  ) {
    return this.promotions.createCampaign(user, dto);
  }

  @Get("campaigns")
  @ApiOperation({ summary: "List promotion campaigns" })
  listCampaigns(
    @CurrentUser() user: AuthenticatedUser,
    @Query("shopId") shopId: string,
  ) {
    return this.promotions.listCampaigns(user, shopId);
  }

  @Get("campaigns/:id")
  @ApiOperation({ summary: "Get a promotion campaign" })
  getCampaign(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.promotions.getCampaign(user, id);
  }

  @Patch("campaigns/:id")
  @ApiOperation({ summary: "Update a promotion campaign" })
  @ApiBody({ type: UpdatePromotionCampaignDto })
  updateCampaign(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdatePromotionCampaignDto,
  ) {
    return this.promotions.updateCampaign(user, id, dto);
  }

  @Delete("campaigns/:id")
  @ApiOperation({ summary: "Soft delete a promotion campaign" })
  deleteCampaign(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.promotions.deleteCampaign(user, id);
  }

  @Post("vouchers")
  @ApiOperation({ summary: "Create a voucher" })
  @ApiBody({ type: CreateVoucherDto })
  createVoucher(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateVoucherDto,
  ) {
    return this.promotions.createVoucher(user, dto);
  }

  @Get("vouchers")
  @ApiOperation({ summary: "List vouchers" })
  listVouchers(
    @CurrentUser() user: AuthenticatedUser,
    @Query("shopId") shopId: string,
  ) {
    return this.promotions.listVouchers(user, shopId);
  }

  @Patch("vouchers/:id")
  @ApiOperation({ summary: "Update a voucher" })
  @ApiBody({ type: UpdateVoucherDto })
  updateVoucher(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateVoucherDto,
  ) {
    return this.promotions.updateVoucher(user, id, dto);
  }

  @Post("pricing-tiers")
  @ApiOperation({ summary: "Create a customer pricing tier" })
  @ApiBody({ type: CreatePricingTierDto })
  createPricingTier(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePricingTierDto,
  ) {
    return this.promotions.createPricingTier(user, dto);
  }

  @Get("pricing-tiers")
  @ApiOperation({ summary: "List customer pricing tiers" })
  listPricingTiers(
    @CurrentUser() user: AuthenticatedUser,
    @Query("shopId") shopId: string,
  ) {
    return this.promotions.listPricingTiers(user, shopId);
  }

  @Patch("pricing-tiers/:id")
  @ApiOperation({ summary: "Update a customer pricing tier" })
  @ApiBody({ type: UpdatePricingTierDto })
  updatePricingTier(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdatePricingTierDto,
  ) {
    return this.promotions.updatePricingTier(user, id, dto);
  }

  @Post("evaluate")
  @ApiOperation({ summary: "Evaluate campaigns, vouchers, and pricing tiers" })
  @ApiBody({ type: EvaluatePromotionsDto })
  evaluate(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EvaluatePromotionsDto,
  ) {
    return this.promotions.evaluate(user, dto);
  }
}
