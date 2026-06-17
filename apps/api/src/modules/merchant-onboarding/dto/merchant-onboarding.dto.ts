import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export const onboardingDistrictSlugs = [
  "tech-bazaar",
  "artisan-valley",
  "harbor-district",
  "wholesale-quarter",
] as const;

export class StartMerchantOnboardingDto {
  @ApiPropertyOptional({ example: "COM" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(160)
  merchantName?: string;
}

export class PublishMerchantOnboardingDto {
  @ApiProperty({ example: "COM" })
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  merchantName!: string;

  @ApiProperty({ example: "Prontera Outfitters" })
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  shopName!: string;

  @ApiProperty({ example: "Fashion" })
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  category!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsUrl({ require_tld: false })
  logoUrl?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsUrl({ require_tld: false })
  bannerUrl?: string;

  @ApiProperty({ enum: onboardingDistrictSlugs, example: "tech-bazaar" })
  @IsIn(onboardingDistrictSlugs)
  districtSlug!: (typeof onboardingDistrictSlugs)[number];
}
