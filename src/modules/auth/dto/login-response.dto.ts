import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserGroup } from 'prisma/generated/enums';

export class LoginResponseDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The verified email address of the user',
  })
  @IsEmail()
  readonly email!: string;

  @ApiProperty({
    example: 'mahabub_dev',
    description: 'Unique username of the account',
  })
  @IsString()
  @IsNotEmpty()
  readonly username!: string;

  @ApiProperty({
    enum: UserGroup,
    example: UserGroup.ADMIN,
    description: 'The access level assigned to the user',
  })
  @IsEnum(UserGroup)
  readonly role!: UserGroup;

  @ApiProperty({
    description: 'JWT access token for authenticating protected routes',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  readonly accessToken!: string;

  @ApiProperty({
    description: 'Token used to generate a new access token once it expires',
    example: 'd8f8a1...29381',
  })
  @IsString()
  @IsNotEmpty()
  readonly refreshToken!: string;

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}
