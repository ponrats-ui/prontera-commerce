import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  CustomerGroupStatus,
  CustomerLoyaltyStatus,
  CustomerLoyaltyTier,
  CustomerNoteVisibility,
  CustomerSource,
  CustomerStatus,
  CustomerTagStatus,
} from "@prisma/client";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
} from "class-validator";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

const trimLower = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

const trimUpper = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

export class CreateCustomerDto {
  @ApiPropertyOptional({ example: "Ada" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  firstName?: string;

  @ApiPropertyOptional({ example: "Merchant" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  lastName?: string;

  @ApiPropertyOptional({ example: "Ada Merchant" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  displayName?: string;

  @ApiPropertyOptional({ example: "customer@example.com" })
  @Transform(trimLower)
  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  email?: string;

  @ApiPropertyOptional({ example: "+15551234567" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({ example: "1990-01-01T00:00:00.000Z" })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  birthDate?: Date;

  @ApiPropertyOptional({ example: "female" })
  @Transform(trimLower)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  gender?: string;

  @ApiPropertyOptional({ example: "en-US" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(35)
  preferredLocale?: string;

  @ApiPropertyOptional({ example: "USD" })
  @Transform(trimUpper)
  @IsOptional()
  @IsString()
  @Length(3, 3)
  preferredCurrency?: string;

  @ApiPropertyOptional({ example: "US" })
  @Transform(trimUpper)
  @IsOptional()
  @IsString()
  @Length(2, 2)
  countryCode?: string;

  @ApiPropertyOptional({ example: "America/New_York" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timeZone?: string;

  @ApiPropertyOptional({ enum: CustomerStatus })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @ApiPropertyOptional({ enum: CustomerSource })
  @IsOptional()
  @IsEnum(CustomerSource)
  source?: CustomerSource;
}

export class UpdateCustomerDto extends CreateCustomerDto {}

export class CreateCustomerAddressDto {
  @ApiPropertyOptional({ example: "Home" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;

  @ApiPropertyOptional({ example: "Ada Merchant" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  recipientName?: string;

  @ApiPropertyOptional({ example: "+15551234567" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiProperty({ example: "123 Main Street" })
  @Transform(trim)
  @IsString()
  @MaxLength(240)
  addressLine1!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(240)
  addressLine2?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  district?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  province?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  postalCode?: string;

  @ApiProperty({ example: "US" })
  @Transform(trimUpper)
  @IsString()
  @Length(2, 2)
  countryCode!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefaultShipping?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefaultBilling?: boolean;
}

export class UpdateCustomerAddressDto {
  @ApiPropertyOptional({ example: "Home" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  label?: string;

  @ApiPropertyOptional({ example: "Ada Merchant" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  recipientName?: string;

  @ApiPropertyOptional({ example: "+15551234567" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({ example: "123 Main Street" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(240)
  addressLine1?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(240)
  addressLine2?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  district?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  province?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(40)
  postalCode?: string;

  @ApiPropertyOptional({ example: "US" })
  @Transform(trimUpper)
  @IsOptional()
  @IsString()
  @Length(2, 2)
  countryCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefaultShipping?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefaultBilling?: boolean;
}

export class CreateCustomerNoteDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @MaxLength(5000)
  note!: string;

  @ApiPropertyOptional({ enum: CustomerNoteVisibility })
  @IsOptional()
  @IsEnum(CustomerNoteVisibility)
  visibility?: CustomerNoteVisibility;
}

export class CreateCustomerGroupDto {
  @ApiProperty({ example: "VIP" })
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: CustomerGroupStatus })
  @IsOptional()
  @IsEnum(CustomerGroupStatus)
  status?: CustomerGroupStatus;
}

export class UpdateCustomerGroupDto {
  @ApiPropertyOptional({ example: "VIP" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: CustomerGroupStatus })
  @IsOptional()
  @IsEnum(CustomerGroupStatus)
  status?: CustomerGroupStatus;
}

export class CreateCustomerTagDto {
  @ApiProperty({ example: "high-value" })
  @Transform(trimLower)
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional({ example: "#0f766e" })
  @Transform(trim)
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ enum: CustomerTagStatus })
  @IsOptional()
  @IsEnum(CustomerTagStatus)
  status?: CustomerTagStatus;
}

export class UpdateCustomerTagDto {
  @ApiPropertyOptional({ example: "high-value" })
  @Transform(trimLower)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional({ example: "#0f766e" })
  @Transform(trim)
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ enum: CustomerTagStatus })
  @IsOptional()
  @IsEnum(CustomerTagStatus)
  status?: CustomerTagStatus;
}

export class UpdateCustomerLoyaltyDto {
  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  pointsBalance?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lifetimePoints?: number;

  @ApiPropertyOptional({ enum: CustomerLoyaltyTier })
  @IsOptional()
  @IsEnum(CustomerLoyaltyTier)
  tier?: CustomerLoyaltyTier;

  @ApiPropertyOptional({ enum: CustomerLoyaltyStatus })
  @IsOptional()
  @IsEnum(CustomerLoyaltyStatus)
  status?: CustomerLoyaltyStatus;
}
