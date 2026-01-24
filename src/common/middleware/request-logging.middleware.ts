import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppLogger } from '../logging/logger.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new AppLogger();

  constructor() {
    this.logger.setContext('RequestLogging');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = uuidv4();
    const startTime = Date.now();

    // Add request ID to request object
    (req as any).id = requestId;

    // Add request ID header to response
    res.setHeader('X-Request-ID', requestId);

    // Log incoming request
    const ip = req.ip ?? 'unknown';
    this.logger.log(
      `Incoming ${req.method} ${req.url} [${requestId}] from ${ip}`,
      'RequestLogging',
    );

    // Log response when finished
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const logLevel = res.statusCode >= 400 ? 'warn' : 'log';

      this.logger[logLevel](
        `Response ${req.method} ${req.url} ${res.statusCode} [${requestId}] ${duration}ms`,
        'RequestLogging',
      );
    });

    next();
  }
}
