import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements NestLoggerService {
  private context?: string;

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string, context?: string): void {
    this.writeLog('INFO', message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.writeLog('ERROR', message, context, { trace });
  }

  warn(message: string, context?: string): void {
    this.writeLog('WARN', message, context);
  }

  debug(message: string, context?: string): void {
    if (process.env.NODE_ENV !== 'production') {
      this.writeLog('DEBUG', message, context);
    }
  }

  verbose(message: string, context?: string): void {
    if (process.env.NODE_ENV !== 'production') {
      this.writeLog('VERBOSE', message, context);
    }
  }

  private writeLog(
    level: string,
    message: string,
    context?: string,
    meta?: any,
  ): void {
    const timestamp = new Date().toISOString();
    const logContext = context || this.context || 'Application';

    const logEntry = {
      timestamp,
      level,
      context: logContext,
      message,
      ...meta,
    };

    // Structured JSON logging for production
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logEntry));
    } else {
      // Human-readable for development
      const colorCode = this.getColorCode(level);
      const resetCode = '\x1b[0m';
      console.log(
        `${colorCode}[${timestamp}] [${level}] [${logContext}]${resetCode} ${message}`,
      );
      if (meta && Object.keys(meta).length > 0) {
        console.log(meta);
      }
    }
  }

  private getColorCode(level: string): string {
    switch (level) {
      case 'ERROR':
        return '\x1b[31m'; // Red
      case 'WARN':
        return '\x1b[33m'; // Yellow
      case 'INFO':
        return '\x1b[32m'; // Green
      case 'DEBUG':
        return '\x1b[36m'; // Cyan
      case 'VERBOSE':
        return '\x1b[35m'; // Magenta
      default:
        return '\x1b[37m'; // White
    }
  }
}
