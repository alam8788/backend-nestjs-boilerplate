import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiError } from 'src/common/errors/api-error';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Token expired
    if (info?.name === 'TokenExpiredError') {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Token has expired');
    }

    // Malformed token
    if (info?.name === 'JsonWebTokenError') {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid token format');
    }

    // No token provided
    if (info?.message === 'No auth token') {
      throw new ApiError(
        HttpStatus.UNAUTHORIZED,
        'Authorization token is required',
      );
    }

    // Other errors during validation
    if (err) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Authentication failed');
    }

    // No user found
    if (!user) {
      throw new ApiError(HttpStatus.UNAUTHORIZED, 'Invalid or expired token');
    }

    return user;
  }
}
