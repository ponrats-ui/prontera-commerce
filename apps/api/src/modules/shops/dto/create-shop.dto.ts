import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  MaxLength,
} from "class-validator";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateShopDto {
  @ApiProperty({ example: "Prontera Outfitters" })
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: "prontera-outfitters" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

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

  @ApiPropertyOptional({ example: "owner@example.com" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  contactEmail?: string;

  @ApiPropertyOptional({ example: "+15551234567" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  contactPhone?: string;

  @ApiProperty({ example: "US" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(2, 2)
  countryCode!: string;

  @ApiProperty({ example: "en-US" })
  @Transform(trim)
  @IsString()
  @MaxLength(35)
  preferredLocale!: string;

  @ApiProperty({ example: "USD" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(3, 3)
  preferredCurrency!: string;

  @ApiProperty({ example: "America/New_York" })
  @Transform(trim)
  @IsString()
  @MaxLength(64)
  timeZone!: string;
}
