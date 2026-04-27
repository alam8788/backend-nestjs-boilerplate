import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginUserDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // ------------- login
  async login(loginUserDto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginUserDto.email },
      select: {
        id: true,
        sid: true,
        email: true,
        username: true,
        password_hash: true,
        first_name: true,
        last_name: true,
        phone: true,
        is_email_verified: true,
        is_phone_verified: true,
        is_two_factor_enabled: true,
        ship_org_id: true,
        user_group: true,
        is_active: true,
        last_login: true,
        last_password_change: true,
        created_at: true,
        updated_at: true,
        created_by: true,
        status: true,
        auth_version: true,
        navy_id: true,
      },
    });
    const financialYearDetails = await this.prisma.financialYear.findUnique({
      where: {
        id: Number(loginUserDto.financial_year),
      },
      select: {
        id: true,
        year_name: true,
        is_active: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    if (!financialYearDetails) {
      throw new UnauthorizedException('Invalid financial year.');
    }
    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException(
        'Your account is currently inactive. Please contact support for assistance.',
      );
    }
    if (!financialYearDetails.is_active) {
      throw new ForbiddenException('Financial year is not active.');
    }

    const isPassValid = await bcrypt.compare(
      loginUserDto.password,
      user.password_hash,
    );
    if (!isPassValid) {
      throw new UnauthorizedException('Invalid credential');
    }

    const token = await this.generateTokens(
      String(user.id),
      user.email,
      user.user_group,
      {
        id: financialYearDetails.id,
        year_name: financialYearDetails.year_name,
      },
      '',
      user.auth_version,
    );

    //TODO ==========  logging here

    return plainToInstance(LoginResponseDto, {
      email: user.email,
      username: user.username,
      role: user.user_group,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
    });
  }

  // generate tokens
  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    financial_year: {
      id: string | number;
      year_name: string;
    },
    scope?: string,
    auth_version?: bigint,
  ) {
    try {
      const payload = {
        sub: userId,
        email: email,
        role: role,
        financial_year: financial_year,
        client_id: process.env.CLIENT_ID,
        scope: scope || '',
        auth_version: auth_version,
      };

      const refreshTokenPayload = {
        sub: userId,
        email: email,
        financial_year: financial_year,
      };

      const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, { expiresIn: '1d' }),
        this.jwtService.signAsync(refreshTokenPayload, { expiresIn: '7d' }),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException('Token Generation failed');
    }
  }
}

//  id: int
//     sid: str
//     email: EmailStr
//     username: str
//     first_name: str
//     last_name: str
//     phone: str | None
//     is_email_verified: bool
//     is_phone_verified: bool
//     is_two_factor_enabled: bool
//     ship_org_id: int | None

//     ship_org_name: str | None = None
//     role_id: int | None = None
//     role_name: str | None = None

//     user_group: UserGroupEnum
//     is_active: bool
//     last_login: datetime | None = None
//     last_password_change: datetime | None = None
//     created_at: datetime
//     updated_at: datetime
//     created_by: int | None = None
//     status: StatusEnum
//     auth_version: int
//     navy_id: str | None = None
//     assigned_role: int | None = None
