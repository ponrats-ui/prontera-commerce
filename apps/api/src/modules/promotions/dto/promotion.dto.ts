import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  PricingTierStatus,
  PromotionStatus,
  PromotionType,
  VoucherStatus,
} from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const trimUpper = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class PromotionRuleDto {
  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumOrderAmount?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minimumQuantity?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsInt()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  buyQuantity?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  getQuantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  targetProductId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  targetCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  targetCustomerGroupId?: string;
}

export class CreatePromotionCampaignDto {
  @ApiProperty()
  @IsUUID()
  shopId!: string;

  @ApiProperty({ example: "VIP Summer Campaign" })
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ enum: PromotionType })
  @IsEnum(PromotionType)
  promotionType!: PromotionType;

  @ApiPropertyOptional({ enum: PromotionStatus })
  @IsOptional()
  @IsEnum(PromotionStatus)
  status?: PromotionStatus;

  @ApiPropertyOptional({ example: "2026-06-16T00:00:00.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  startsAt?: Date;

  @ApiPropertyOptional({ example: "2026-06-30T23:59:59.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endsAt?: Date;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @ApiPropertyOptional({ type: [PromotionRuleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionRuleDto)
  rules?: PromotionRuleDto[];
}

export class UpdatePromotionCampaignDto {
  @ApiPropertyOptional({ example: "VIP Summer Campaign" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: PromotionType })
  @IsOptional()
  @IsEnum(PromotionType)
  promotionType?: PromotionType;

  @ApiPropertyOptional({ enum: PromotionStatus })
  @IsOptional()
  @IsEnum(PromotionStatus)
  status?: PromotionStatus;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  startsAt?: Date;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endsAt?: Date;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  stackable?: boolean;

  @ApiPropertyOptional({ type: [PromotionRuleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionRuleDto)
  rules?: PromotionRuleDto[];
}

export class CreateVoucherDto {
  @ApiProperty()
  @IsUUID()
  shopId!: string;

  @ApiProperty()
  @IsUUID()
  campaignId!: string;

  @ApiProperty({ example: "VIP10" })
  @Transform(trimUpper)
  @IsString()
  @MaxLength(80)
  code!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: VoucherStatus })
  @IsOptional()
  @IsEnum(VoucherStatus)
  status?: VoucherStatus;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  startsAt?: Date;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endsAt?: Date;
}

export class UpdateVoucherDto {
  @ApiPropertyOptional({ enum: VoucherStatus })
  @IsOptional()
  @IsEnum(VoucherStatus)
  status?: VoucherStatus;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  startsAt?: Date;

  @ApiPropertyOptional()
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endsAt?: Date;
}

export class CreatePricingTierDto {
  @ApiProperty()
  @IsUUID()
  shopId!: string;

  @ApiProperty()
  @IsUUID()
  customerGroupId!: string;

  @ApiProperty({ example: "VIP Pricing" })
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(1)
  @Max(100)
  discountPercent!: number;

  @ApiPropertyOptional({ enum: PricingTierStatus })
  @IsOptional()
  @IsEnum(PricingTierStatus)
  status?: PricingTierStatus;
}

export class UpdatePricingTierDto {
  @ApiPropertyOptional({ example: "VIP Pricing" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  discountPercent?: number;

  @ApiPropertyOptional({ enum: PricingTierStatus })
  @IsOptional()
  @IsEnum(PricingTierStatus)
  status?: PricingTierStatus;
}

export class EvaluateOrderItemDto {
  @ApiProperty()
  @IsUUID()
  productVariantId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class EvaluatePromotionsDto {
  @ApiProperty()
  @IsUUID()
  shopId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @ApiProperty({ type: [EvaluateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EvaluateOrderItemDto)
  orderItems!: EvaluateOrderItemDto[];

  @ApiPropertyOptional({ example: "VIP10" })
  @Transform(trimUpper)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  voucherCode?: string;
}
