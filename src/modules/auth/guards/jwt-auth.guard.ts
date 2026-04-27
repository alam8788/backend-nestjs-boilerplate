import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiError } from 'src/common/errors/api-error';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    try {
      return super.canActivate(context);
    } catch (error) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Authorization token is required',
      );
    }
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        info?.message || 'Invalid or expired token',
      );
    }

    return user;
  }
}
