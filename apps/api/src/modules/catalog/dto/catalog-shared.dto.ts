import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export const SUPPORTED_CATALOG_LOCALES = [
  "th-TH",
  "en-US",
  "ja-JP",
  "zh-CN",
] as const;

export type SupportedCatalogLocale = (typeof SUPPORTED_CATALOG_LOCALES)[number];

export const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export const trimLower = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

export class CategoryTranslationInputDto {
  @ApiProperty({ enum: SUPPORTED_CATALOG_LOCALES, example: "en-US" })
  @IsIn(SUPPORTED_CATALOG_LOCALES)
  locale!: SupportedCatalogLocale;

  @ApiProperty({ example: "Adventurer Gear" })
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
}

export class ProductTranslationInputDto {
  @ApiProperty({ enum: SUPPORTED_CATALOG_LOCALES, example: "en-US" })
  @IsIn(SUPPORTED_CATALOG_LOCALES)
  locale!: SupportedCatalogLocale;

  @ApiProperty({ example: "Traveler Jacket" })
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(8000)
  description?: string;
}
