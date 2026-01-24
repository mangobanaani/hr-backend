import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class EndpointThrottleGuard extends ThrottlerGuard {
  protected override async getTracker(req: Record<string, any>): Promise<string> {
    const request = req as Request;
    // Track by IP + endpoint + method for granular rate limiting
    const ip = request.ip || request.socket.remoteAddress || 'unknown';
    const endpoint = request.url;
    const method = request.method;
    return `${ip}-${method}-${endpoint}`;
  }

  protected override async throwThrottlingException(): Promise<void> {
    throw new ThrottlerException(
      'Too many requests from this IP for this endpoint. Please try again later.',
    );
  }
}
