import { ApiProperty } from "@nestjs/swagger";

export class AuthUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ nullable: true })
  name!: string | null;

  @ApiProperty({ type: [String] })
  roles!: string[];

  @ApiProperty({ nullable: true })
  preferredLocale!: string | null;

  @ApiProperty({ nullable: true })
  preferredCurrency!: string | null;

  @ApiProperty({ nullable: true })
  countryCode!: string | null;

  @ApiProperty()
  timezone!: string;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}
