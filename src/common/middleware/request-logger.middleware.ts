import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const startedAt = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const duration = Date.now() - startedAt;
      const { statusCode } = res;
      const message = `${method} ${originalUrl} -> ${statusCode} (${duration}ms)`;
      const logEntry = {
        method,
        url: originalUrl,
        statusCode,
        durationMs: duration,
        userAgent: req.get('user-agent') ?? '-',
      };

      if (statusCode >= 500) {
        this.logger.error(message, JSON.stringify(logEntry));
      } else if (statusCode >= 400) {
        this.logger.warn(message, JSON.stringify(logEntry));
      } else {
        this.logger.log(message, JSON.stringify(logEntry));
      }
    });

    next();
  }
}
