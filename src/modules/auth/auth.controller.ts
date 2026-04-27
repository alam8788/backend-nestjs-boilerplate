import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginUserDto } from './dto/login.dto';
import { Response } from 'express';
import { sendResponse } from 'src/common/responses/send-response';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ------------ login --------------
  @Post()
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user and return JWT tokens',
  })
  @ApiResponse({
    status: 200,
    description: 'Login Successful.',
    type: LoginResponseDto,
  })
  @ApiBody({ type: LoginUserDto })
  async login(@Body() loginDto: LoginUserDto, @Res() res: Response) {
    try {
      const result = await this.authService.login(loginDto);
      sendResponse(res, {
        statusCode: HttpStatus.OK,
        success: true,
        message: 'Login Successful.',
        data: result,
      });
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
