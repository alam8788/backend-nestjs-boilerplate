import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto, LoginResponseDto } from './dto/login-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { SecurityService } from 'src/core/security/security.service';
import { plainToInstance } from 'class-transformer';
import { MailService } from '../mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { sendResponse } from 'src/common/responses/send-response';

type AccessTokenType = { id: number; email: string; role: string };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly securityService: SecurityService,
    private readonly mail: MailService,
  ) {}

  // ========== login ===========
  async login(loginAuthDto: LoginAuthDto) {
    try {
      const { email, password } = loginAuthDto;

      const user = await this.authRepository.checkEmail(email);
      this.logger.log('user data =>', user);
      if (!user) {
        throw new Error('Incorrect credentials.');
      }

      const isPasswordMatch = await this.securityService.comparePassword(
        password,
        user.passwordHash,
      );
      if (!isPasswordMatch) {
        throw new Error('Incorrect credentials.');
      }

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      const token = await this.generateToken(payload);

      return plainToInstance(LoginResponseDto, {
        id: user.id,
        sid: user.sid,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        tokens: {
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
        },
      });
    } catch (error: any) {
      this.logger.error('login error =>', error);
      throw new BadRequestException(error.message);
    }
  }

  // ========== send verification email
  async sendVerificationEmailOtp(userId: number) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
      });

      if (user.emailVerified) {
        throw new Error('Invalid request.');
      }

      const otp = this.generateOtp();
      const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          verifyOtp: otp,
          verifyOtpExpiry: expiresAt,
        },
      });

      await this.mail.sendEmailVerificationOtp(user.email, otp);
      return { message: 'Email Verification otp sent successfully.' };
    } catch (error: any) {
      this.logger.error('send email otp error =>', error);
      throw new BadRequestException(error.message);
    }
  }

  // ========= verify email =========
  async verifyEmail(userId: number, otp: string) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
      });

      if (!user.verifyOtpExpiry || !user.verifyOtp) {
        throw new Error('OTP verification failed');
      }

      if (user.verifyOtpExpiry < new Date() || user.verifyOtp !== otp) {
        throw new Error('Invalid or expired OTP');
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          emailVerified: true,
          verifyOtp: null,
          verifyOtpExpiry: null,
        },
      });

      return { message: 'Email verified successfully' };
    } catch (error: any) {
      this.logger.error('email verification error =>', error);
      throw new BadRequestException(error.message);
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateToken(data: AccessTokenType) {
    try {
      const payload = {
        sub: data.id,
        email: data.email,
        role: data.role,
        type: 'access',
      };
      const refreshTokenPayload = {
        sub: data.id,
        email: data.email,
        role: data.role,
        type: 'refresh',
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
          expiresIn: '1d',
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        }),
        this.jwtService.signAsync(refreshTokenPayload, {
          expiresIn: '7d',
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        }),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      this.logger.error('Token generation failed', error);
      throw new InternalServerErrorException('Token Generation failed');
    }
  }
}
