import { ApiProperty } from "@nestjs/swagger";
import { ShopStaffRole } from "@prisma/client";
import { Transform, Type } from "class-transformer";
import { IsDate, IsEmail, IsEnum, MaxLength } from "class-validator";

export class CreateShopInvitationDto {
  @ApiProperty({ example: "manager@example.com" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ enum: ShopStaffRole, example: ShopStaffRole.MANAGER })
  @IsEnum(ShopStaffRole)
  role!: ShopStaffRole;

  @ApiProperty({ example: "2026-07-14T00:00:00.000Z" })
  @Type(() => Date)
  @IsDate()
  expiresAt!: Date;
}
