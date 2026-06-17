import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { FounderCampaignEventType } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from "class-validator";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export const founderApplicationStatuses = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;

export class CreateFounderApplicationDto {
  @ApiProperty({ example: "COM" })
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  merchantName!: string;

  @ApiProperty({ example: "Prontera Outfitters" })
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  businessName!: string;

  @ApiProperty({ example: "Computer Store" })
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  businessType!: string;

  @ApiProperty({ example: "IT Equipment" })
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  category!: string;

  @ApiPropertyOptional({ example: "https://example.com" })
  @Transform(trim)
  @IsOptional()
  @IsUrl({ require_tld: false })
  website?: string;

  @ApiPropertyOptional({ example: "https://facebook.com/prontera" })
  @Transform(trim)
  @IsOptional()
  @IsUrl({ require_tld: false })
  facebookPage?: string;

  @ApiProperty({ example: "merchant@example.com" })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ example: "+66812345678" })
  @Transform(trim)
  @IsString()
  @MaxLength(40)
  phone!: string;

  @ApiProperty({
    example:
      "I want to join early because Prontera can help my shop build a long-term digital presence.",
  })
  @Transform(trim)
  @IsString()
  @MinLength(20)
  @MaxLength(3000)
  motivation!: string;
}

export class ReviewFounderApplicationDto {
  @ApiPropertyOptional({
    description:
      "Optional shop to grant Founder Merchant status to during approval.",
  })
  @IsOptional()
  @IsUUID()
  shopId?: string;

  @ApiPropertyOptional({ example: "Strong fit for Tech Bazaar." })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(3000)
  reviewNotes?: string;
}

export class ListFounderApplicationsQueryDto {
  @ApiPropertyOptional({ enum: founderApplicationStatuses })
  @IsOptional()
  @IsIn(founderApplicationStatuses)
  status?: (typeof founderApplicationStatuses)[number];
}

export class FounderWaitlistDto {
  @ApiProperty({ example: "COM" })
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  merchantName!: string;

  @ApiProperty({ example: "Velora PC" })
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  businessName!: string;

  @ApiProperty({ example: "merchant@example.com" })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ example: "Computer Store" })
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  category!: string;

  @ApiPropertyOptional({ example: "facebook" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @ApiPropertyOptional({ example: "FOUNDER-COM" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  referralCode?: string;
}

export class FounderReferralDto {
  @ApiProperty({ example: "founder@example.com" })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(320)
  referrerEmail!: string;

  @ApiProperty({ example: "friend@example.com" })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(320)
  referredEmail!: string;

  @ApiPropertyOptional({ example: "FOUNDER-COM" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  referralCode?: string;
}

export class FounderCampaignEventDto {
  @ApiProperty({ enum: FounderCampaignEventType })
  @IsIn(Object.values(FounderCampaignEventType))
  eventType!: FounderCampaignEventType;

  @ApiPropertyOptional({ example: "landing" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @ApiPropertyOptional({ example: "founder-launch" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  campaign?: string;

  @ApiPropertyOptional({ example: "FOUNDER-COM" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  referralCode?: string;
}
