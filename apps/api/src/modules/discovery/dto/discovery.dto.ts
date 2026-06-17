import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { MerchantDiscoveryEventType } from "@prisma/client";
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

export class DiscoveryQueryDto {
  @ApiPropertyOptional({ example: "coffee" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ example: "FOOD" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @ApiPropertyOptional({ example: "merchant-city" })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  citySlug?: string;

  @ApiPropertyOptional({ example: "founder-district" })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  districtSlug?: string;
}

export class TrackDiscoveryEventDto {
  @ApiProperty({ enum: MerchantDiscoveryEventType })
  @IsEnum(MerchantDiscoveryEventType)
  eventType!: MerchantDiscoveryEventType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  shopId?: string;

  @ApiPropertyOptional({ example: "coffee" })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  searchTerm?: string;

  @ApiPropertyOptional({ example: "FOOD" })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @ApiPropertyOptional({ example: "discover-home" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
