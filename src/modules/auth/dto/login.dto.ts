import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    example: 'mahabub@gmail.com',
    description: 'The registered email address used for authentication',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  readonly email!: string;

  @ApiProperty({
    example: '12345678',
    description: 'Account password (minimum 8 characters)',
    minLength: 8,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  readonly password!: string;

  @ApiProperty({
    example: '2023-2024',
    description: 'The financial year user want to login ',
  })
  @IsString()
  @IsNotEmpty()
  readonly financial_year!: string;
}
