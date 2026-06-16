import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SubscriptionPlanType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsOptional, IsUUID } from "class-validator";

export class UpgradeSubscriptionDto {
  @ApiProperty()
  @IsUUID()
  shopId!: string;

  @ApiPropertyOptional({
    enum: SubscriptionPlanType,
    default: SubscriptionPlanType.PRO,
  })
  @IsOptional()
  @IsEnum(SubscriptionPlanType)
  planType?: SubscriptionPlanType;
}

export class CancelSubscriptionDto {
  @ApiProperty()
  @IsUUID()
  shopId!: string;
}

export class GrantFounderMerchantDto {
  @ApiProperty()
  @IsUUID()
  shopId!: string;

  @ApiPropertyOptional({ example: "2027-06-16T00:00:00.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  founderExpiresAt?: Date;
}
