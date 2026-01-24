import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface StandardErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  errorCode: string;
  requestId: string;
  timestamp: string;
  path: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message ?? exception.message;

    const error =
      typeof exceptionResponse === 'object' && 'error' in exceptionResponse
        ? (exceptionResponse as any).error
        : exception.name;

    const requestId = uuidv4();
    const errorCode = this.getErrorCode(statusCode, error);

    const errorResponse: StandardErrorResponse = {
      statusCode,
      message,
      error,
      errorCode,
      requestId,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.setHeader('X-Request-ID', requestId);
    response.status(statusCode).json(errorResponse);
  }

  private getErrorCode(status: number, error: string): string {
    const errorMap: Record<string, string> = {
      'Bad Request': 'BAD_REQUEST',
      'Unauthorized': 'UNAUTHORIZED',
      'Forbidden': 'FORBIDDEN',
      'Not Found': 'NOT_FOUND',
      'Conflict': 'CONFLICT',
      'Unprocessable Entity': 'VALIDATION_ERROR',
      'Too Many Requests': 'RATE_LIMIT_EXCEEDED',
      'Internal Server Error': 'INTERNAL_ERROR',
    };

    return errorMap[error] ?? `HTTP_${status}`;
  }
}
