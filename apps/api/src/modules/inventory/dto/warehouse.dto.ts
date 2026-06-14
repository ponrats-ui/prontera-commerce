import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { WarehouseStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from "class-validator";

const trim = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateWarehouseDto {
  @ApiProperty({ example: "Bangkok Main Warehouse" })
  @Transform(trim)
  @IsString()
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: "BKK-MAIN" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @MaxLength(80)
  @Matches(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/)
  code!: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  address?: string;

  @ApiProperty({ example: "TH" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @Length(2, 2)
  countryCode!: string;

  @ApiProperty({ example: "Asia/Bangkok" })
  @Transform(trim)
  @IsString()
  @MaxLength(64)
  timezone!: string;

  @ApiPropertyOptional({ enum: WarehouseStatus })
  @IsOptional()
  @IsEnum(WarehouseStatus)
  status?: WarehouseStatus;
}

export class UpdateWarehouseDto {
  @ApiPropertyOptional({ example: "Bangkok Main Warehouse" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({ example: "BKK-MAIN" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(80)
  @Matches(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/)
  code?: string;

  @ApiPropertyOptional()
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  address?: string;

  @ApiPropertyOptional({ example: "TH" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  @IsOptional()
  @IsString()
  @Length(2, 2)
  countryCode?: string;

  @ApiPropertyOptional({ example: "Asia/Bangkok" })
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @ApiPropertyOptional({ enum: WarehouseStatus })
  @IsOptional()
  @IsEnum(WarehouseStatus)
  status?: WarehouseStatus;
}
