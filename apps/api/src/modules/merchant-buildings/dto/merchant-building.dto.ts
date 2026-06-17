import { ApiPropertyOptional } from "@nestjs/swagger";
import { BuildingType, StorefrontTheme } from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
} from "class-validator";

export class BuildingSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  shopId?: string;

  @ApiPropertyOptional({ enum: StorefrontTheme })
  @IsOptional()
  @IsEnum(StorefrontTheme)
  storefrontTheme?: StorefrontTheme;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  logoUrl?: string;

  @ApiPropertyOptional({ example: "Velora PC" })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  signText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false })
  bannerUrl?: string;
}

export class AdminBuildingUpdateDto extends BuildingSettingsDto {
  @ApiPropertyOptional({ enum: BuildingType })
  @IsOptional()
  @IsEnum(BuildingType)
  buildingType?: BuildingType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  buildingLevel?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOfficialStore?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
