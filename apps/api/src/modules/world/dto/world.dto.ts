import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  CommerceGateStatus,
  CommerceGateType,
  WorldZoneStatus,
} from "@prisma/client";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from "class-validator";

export class CreateWorldZoneDto {
  @ApiProperty({ example: "PRONTERA" })
  @Matches(/^[A-Z0-9_]+$/)
  @MaxLength(80)
  code!: string;

  @ApiProperty({ example: "Prontera" })
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: WorldZoneStatus })
  @IsOptional()
  @IsEnum(WorldZoneStatus)
  status?: WorldZoneStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  mapImageUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateWorldDistrictDto {
  @ApiProperty()
  @IsUUID()
  zoneId!: string;

  @ApiProperty({ example: "FASHION_STREET" })
  @Matches(/^[A-Z0-9_]+$/)
  @MaxLength(80)
  code!: string;

  @ApiProperty({ example: "Fashion Street" })
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "FASHION" })
  @IsString()
  @MaxLength(80)
  category!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateCommerceGateDto {
  @ApiProperty()
  @IsUUID()
  sourceZoneId!: string;

  @ApiProperty()
  @IsUUID()
  destinationZoneId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sourceDistrictId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  destinationDistrictId?: string;

  @ApiProperty({ example: "Prontera to Geffen Merchant Portal" })
  @IsString()
  @MaxLength(160)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CommerceGateType })
  @IsEnum(CommerceGateType)
  gateType!: CommerceGateType;

  @ApiPropertyOptional({ enum: CommerceGateStatus })
  @IsOptional()
  @IsEnum(CommerceGateStatus)
  status?: CommerceGateStatus;
}

export class TravelQueryDto {
  @ApiPropertyOptional({ example: "keyboard" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  searchTerm?: string;
}
