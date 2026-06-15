import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { LiveChannelProvider, LiveChannelStatus } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from "class-validator";

export class CreateLiveChannelDto {
  @ApiPropertyOptional({
    enum: LiveChannelProvider,
    default: LiveChannelProvider.YOUTUBE,
  })
  @IsOptional()
  @IsEnum(LiveChannelProvider)
  provider?: LiveChannelProvider;

  @ApiProperty({ example: "Friday Live Product Demo" })
  @IsString()
  @MaxLength(160)
  title!: string;

  @ApiPropertyOptional({ example: "Live selling session for new arrivals." })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })
  @IsString()
  @IsUrl({ require_protocol: true })
  videoUrl!: string;

  @ApiPropertyOptional({ example: "https://cdn.example.com/live-thumb.jpg" })
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    enum: LiveChannelStatus,
    default: LiveChannelStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(LiveChannelStatus)
  status?: LiveChannelStatus;

  @ApiPropertyOptional({ example: "2026-06-15T12:00:00.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  startsAt?: Date;

  @ApiPropertyOptional({ example: "2026-06-15T13:00:00.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endsAt?: Date;
}

export class UpdateLiveChannelDto {
  @ApiPropertyOptional({ enum: LiveChannelProvider })
  @IsOptional()
  @IsEnum(LiveChannelProvider)
  provider?: LiveChannelProvider;

  @ApiPropertyOptional({ example: "Friday Live Product Demo" })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @ApiPropertyOptional({ example: "Live selling session for new arrivals." })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  })
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  videoUrl?: string;

  @ApiPropertyOptional({ example: "https://cdn.example.com/live-thumb.jpg" })
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ enum: LiveChannelStatus })
  @IsOptional()
  @IsEnum(LiveChannelStatus)
  status?: LiveChannelStatus;

  @ApiPropertyOptional({ example: "2026-06-15T12:00:00.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  startsAt?: Date;

  @ApiPropertyOptional({ example: "2026-06-15T13:00:00.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endsAt?: Date;
}

export class LiveCommerceAccessDto {
  @ApiProperty()
  canUseLiveCommerce!: boolean;

  @ApiProperty({ example: "PRO" })
  minimumPlan!: string;
}
