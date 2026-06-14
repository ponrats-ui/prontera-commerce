import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ShopStaffRole, StaffStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class AddShopStaffDto {
  @ApiProperty({ example: "staff@example.com" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ enum: ShopStaffRole, example: ShopStaffRole.STAFF })
  @IsEnum(ShopStaffRole)
  role!: ShopStaffRole;

  @ApiPropertyOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;
}

export class UpdateShopStaffDto {
  @ApiPropertyOptional({ enum: ShopStaffRole })
  @IsOptional()
  @IsEnum(ShopStaffRole)
  role?: ShopStaffRole;

  @ApiPropertyOptional({ enum: StaffStatus })
  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;

  @ApiPropertyOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(120)
  title?: string;
}
