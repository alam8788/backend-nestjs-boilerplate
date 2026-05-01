import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UserRole } from 'prisma/generated/enums';
import { AuthService } from './auth.service';
import { Roles } from './decorator/roles.decorator';
import { LoginAuthDto } from './dto/login-auth.dto';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User Login' })
  @ApiBody({ type: LoginAuthDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error.',
  })
  async login(@Body() loginAuthDto: LoginAuthDto) {
    return await this.authService.login(loginAuthDto);
  }

  // =========== Get email verification code
  @Post('send-enail-otp')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin_user, UserRole.normal_user)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get email verification code' })
  @ApiResponse({
    status: 200,
    description: 'OTP send successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request',
  })
  async sendEmailVerificationOtp(@Req() req: Request) {
    const userId = Number((req.user as { id: string }).id);
    return await this.authService.sendVerificationEmailOtp(userId);
  }

  // =========== verify email otp
  @Post('verify-email')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin_user, UserRole.normal_user)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation error.',
  })
  async verifyEmail(@Req() req: Request, @Body() verifyEmail: VerifyEmailDto) {
    const userId = Number((req.user as { id: string }).id);
    return await this.authService.verifyEmail(userId, verifyEmail.otp);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }
}
