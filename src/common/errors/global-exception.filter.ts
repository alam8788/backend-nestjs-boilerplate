import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  PayloadTooLargeException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client-runtime-utils';
import { Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { MulterError } from 'multer';
import { ApiError } from './api-error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    /* ---------------- MULTER ERRORS ---------------- */
    if (exception instanceof MulterError) {
      switch (exception.code) {
        case 'LIMIT_FILE_SIZE':
          statusCode = HttpStatus.PAYLOAD_TOO_LARGE;
          message = 'File size exceeds the allowed limit';
          error = 'Payload Too Large';
          break;

        case 'LIMIT_FILE_COUNT':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Too many files uploaded. Only one file allowed.';
          error = 'Bad Request';
          break;

        case 'LIMIT_UNEXPECTED_FILE':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'Unexpected file field. Expected field name "video".';
          error = 'Bad Request';
          break;

        default:
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'File upload error occurred.';
          error = 'Bad Request';
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      /* ---------------- PRISMA ERRORS ---------------- */
      statusCode = HttpStatus.BAD_REQUEST;
      error = 'Database Error';

      switch (exception.code) {
        case 'P2002': {
          const target = exception.meta?.target as string[] | undefined;
          message = `Unique constraint failed on ${target?.join(', ')}`;
          break;
        }

        case 'P2003':
          message = 'Foreign key constraint failed';
          break;

        case 'P2025':
          statusCode = HttpStatus.NOT_FOUND;
          message = (exception.meta?.cause as string) || 'Record not found';
          break;

        case 'P2001':
          statusCode = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          break;

        case 'P2016':
          message = 'Required relation not found';
          break;

        default:
          message = `Database error: ${exception.code}`;
      }
    } else if (exception instanceof PrismaClientValidationError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Database validation error';
      error = 'Validation Error';
    } else if (exception instanceof PrismaClientInitializationError) {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Database connection error';
      error = 'Service Unavailable';
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unknown database error';
      error = 'Database Error';
    } else if (exception instanceof TokenExpiredError) {
      /* ---------------- JWT ERRORS ---------------- */
      statusCode = HttpStatus.UNAUTHORIZED;
      message = 'Token expired';
      error = exception.message;
    } else if (exception instanceof JsonWebTokenError) {
      statusCode = HttpStatus.UNAUTHORIZED;
      message = 'Invalid token';
      error = exception.message;
    } else if (exception instanceof UnauthorizedException) {
      /* ---------------- AUTH ERRORS ---------------- */
      statusCode = HttpStatus.UNAUTHORIZED;
      const res = exception.getResponse();
      message =
        typeof res === 'object' ? (res as any).message || 'Unauthorized' : res;
      error = 'Unauthorized';
    } else if (exception instanceof ForbiddenException) {
      statusCode = HttpStatus.FORBIDDEN;
      const res = exception.getResponse();
      message =
        typeof res === 'object' ? (res as any).message || 'Forbidden' : res;
      error = 'Forbidden';

      if (
        typeof message === 'string' &&
        (message.includes('role') || message.includes('permission'))
      ) {
        error = 'Insufficient Permissions';
        message =
          'You do not have the required permissions to access this resource';
      }
    } else if (exception instanceof ConflictException) {
      statusCode = HttpStatus.CONFLICT;
      const res = exception.getResponse();
      message =
        typeof res === 'object' ? (res as any).message || 'Conflict' : res;
      error = 'Conflict';
    } else if (exception instanceof ApiError) {
      /* ---------------- CUSTOM API ERROR ---------------- */
      statusCode = exception.statusCode;
      message = exception.message;
      error = exception.message;
    } else if (exception instanceof BadRequestException) {
      /* ---------------- VALIDATION ERRORS ---------------- */
      const res = exception.getResponse();

      if (typeof res === 'object' && Array.isArray((res as any).message)) {
        statusCode = HttpStatus.BAD_REQUEST;
        message = (res as any).message.join(', ');
        error = 'Validation Error';
      } else {
        statusCode = HttpStatus.BAD_REQUEST;
        message = typeof res === 'object' ? (res as any).message : res;
        error = 'Bad Request';
      }
    } else if (exception instanceof PayloadTooLargeException) {
      /* ---------------- OTHER ERRORS ---------------- */
      statusCode = HttpStatus.PAYLOAD_TOO_LARGE;
      message = 'File size exceeds the allowed limit';
      error = 'Payload Too Large';
    } else if (exception instanceof NotFoundException) {
      statusCode = HttpStatus.NOT_FOUND;
      const res = exception.getResponse();
      message =
        typeof res === 'object'
          ? (res as any).message || 'Resource not found'
          : res;
      error = 'Not Found';
    } else if (exception instanceof TypeError) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = exception.message || 'A type error occurred';
      error = 'Type Error';
    }

    /* ---------------- FALLBACK ---------------- */
    if (exception instanceof Error && message === 'Internal server error') {
      message = exception.message;
    }

    /* ---------------- LOG ERROR ---------------- */
    console.error('GlobalExceptionFilter caught:', exception);

    /* ---------------- RESPONSE ---------------- */
    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
